import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Config } from '../schema/config.schema';
import { readFile } from '../utils';
import * as process from 'node:process';
import { fileExistsSync } from 'tsconfig-paths/lib/filesystem';
import { LogService } from '../log/log.service';
import * as _ from 'lodash';

@Injectable()
export class TransformService {
  private configs: Config[];

  constructor(
    @InjectDataSource('data_warehouse')
    private dataSource: DataSource,
    @InjectDataSource()
    private dataSourceStaging: DataSource,
    private logService: LogService,
  ) {}

  async start() {
    // 3. gọi hàm getTable() lấy danh sách các bảng
    const tables = await this.getTables();
    // 4. lấy câu sql để transform và các câu lệnh transform với bảng dimension
    const [transformSQL, procs] = await Promise.all([
      // 4.1 gọi hàm getTransformSQL() để lấy sql transform
      this.getTransformSQL(),
      // 4.2 gọi hàm getProc(tables)
      this.getProc(tables),
    ]);
    // 5. sau await hoàn thành đọc sql từ file
    // 6. thực hiện transform gọi hàm transform()
    await this.transform(procs, tables, transformSQL.toString());
    // sau khi hàm transform hoàn thành
    // 9.2 Ghi log thành công
    await this.logService.logEvent(null, 'SUCCESSFULLY', 'TRANSFORM DONE', '');
  }

  async getTables() {
    const tables = await this.dataSource.query(
      "select table_name from information_schema.tables where table_schema = 'public'",
    );
    return tables
      .map((table: { table_name: any }) => table.table_name)
      .filter((name) => name !== 'phone_table');
  }

  async getTransformSQL() {
    let sql: unknown;
    // 4.1.1 đọc sql nếu file tồn tại
    if (fileExistsSync(`${process.env.PWD}/sqls/exec/staging/transform.sql`)) {
      sql = await readFile(
        `${process.env.PWD}/sqls/exec/staging/transform.sql`,
      );
    }
    // 4.1.2 nếu file chứa sql transform không tồn tại hoặc dữ liệu trống ghi log
    if (typeof sql !== 'string' || _.isEmpty(sql.trim())) {
      await this.logService.logEvent(
        null,
        'ERROR',
        'TRANSFORM CANNOT EXECUTE',
        'SQL Transform does not exist',
      );
      // 4.1.3 Trả về response error status code 400 BadRequestException
      throw new BadRequestException('SQL Transform does not exist');
    }

    return sql;
  }

  async getProc(tables: string[]) {
    const result = {};
    // lấy sql của các bảng dimension
    await Promise.all(
      // 4.2.1 lặp qua từng tên bảng
      tables.map(async (table) => {
        let sql: unknown;
        if (
          // 4.2.2 Đọc file sqls/exec/dimension/${table}.sql để lấy sql load vào bảng dimension
          fileExistsSync(`${process.env.PWD}/sqls/exec/dimension/${table}.sql`)
        ) {
          sql = await readFile(
            `${process.env.PWD}/sqls/exec/dimension/${table}.sql`,
          );
        }
        // 4.2.3 nếu file chứa sql của bất kỳ dimension nào không tồn tại ghi log
        if (typeof sql !== 'string' || _.isEmpty(sql.trim())) {
          await this.logService.logEvent(
            null,
            'ERROR',
            `Missing procedure for dimension table: ${table}`,
            'Missing ERROR',
          );
          // 4.2.4 Trả về response error status code 400  BadRequestException
          throw new BadRequestException(
            'Missing procedure for dimension table',
          );
        }
        result[table] = sql;
      }),
    );
    return result;
  }

  async transform(
    procs: { [fieldName: string]: string },
    tables: string[],
    transformSQL: string,
  ) {
    // 7. TRUNCATE bảng staging_transform
    await this.dataSourceStaging.query('TRUNCATE staging_transform');
    let offset = 0;
    while (true) {
      // 8 Chia dữ liệu staging thành từng nhóm 50 dòng dữ liệu
      const data = await this.dataSourceStaging.query(
        `SELECT * FROM public.staging ORDER BY id OFFSET ${offset} LIMIT 50`,
      );
      if (data.length === 0) break;
      await Promise.all(
        // 9. Duyệt qua từng nhóm dữ liệu (50 dòng)
        data.map(async (child) => {
          let cloneTransformSQL = transformSQL;
          // 9.1.1 Lặp qua từng tên bảng
          for (const table of tables) {
            // lấy câu sql của bảng
            const proc = procs[table];

            const columns = proc
              .match(/<([^>]+)>/g)
              .map((match) => match.slice(1, -1));
            let cloneProc: string = proc;
            // 9.1.2.Thay thế các giá trị vào sql  dimension bằng cách áp dụng procedure của bảng.
            for (const column of columns) {
              cloneProc = cloneProc.replace(
                `<${column}>`,
                `${child[column] || 'NULL'}`,
              );
            }
            try {
              // 9.1.2.1 chèn dữ liệu mới vào bảng dimension.
              const results = await this.dataSource.query(cloneProc);
              // 9.1.2.2 Thay thế id của dimension vừa được thêm vào câu lệnh sql transform
              for (const field in results[0]) {
                cloneTransformSQL = cloneTransformSQL.replace(
                  `<${field}>`,
                  results[0][field] || 'NULL',
                );
              }
            } catch (error) {
              // 10. Ghi log cảnh báo
              await this.logService.logEvent(
                null,
                'WARNING',
                `LOAD TO DIMENSION IS MISSING: ${cloneProc}`,
                error.message,
              );

              return;
            }
          }
          // 9.1.3. Thay thế các dữ liệu không phải dimension vào câu sql transform

          const columns = cloneTransformSQL
            .match(/<([^>]+)>/g)
            .map((match) => match.slice(1, -1));
          for (const column of columns) {
            cloneTransformSQL = cloneTransformSQL.replace(
              `<${column}>`,
              `${child[column] || 'NULL'}`,
            );
          }
          try {
            // 9.1.4 Thực hiện insert dữ liệu vào bảng staging_transform
            await this.dataSourceStaging.query(cloneTransformSQL);
          } catch (error) {
            // 10. Ghi log cảnh báo nếu xảy ra lỗi
            await this.logService.logEvent(
              null,
              'WARNING',
              `TRANSFORM IS MISSING: ${cloneTransformSQL}`,
              error.message,
            );
          }
        }),
      );
      offset += 50;
    }
  }
}
