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
    // 1. Lấy danh sách các bảng dimension
    const tables = await this.getTables();
    // 2. lấy câu sql để transform và các câu lệnh transform với bảng dimension
    const [transformSQL, procs] = await Promise.all([
      this.getTransformSQL(),
      this.getProc(tables),
    ]);
    // 3 thực hiện transform
    await this.transform(procs, tables, transformSQL.toString());
    // kết thúc quá trình transform ghi log thành công
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
    // đọc sql nếu file tồn tại
    if (fileExistsSync(`${process.env.PWD}/sqls/exec/staging/transform.sql`)) {
      sql = await readFile(
        `${process.env.PWD}/sqls/exec/staging/transform.sql`,
      );
    }
    // nếu file chứa sql transform không tồn tại hoặc dữ liệu trống ghi log và trả về lỗi 400
    if (typeof sql !== 'string' || _.isEmpty(sql.trim())) {
      await this.logService.logEvent(
        null,
        'ERROR',
        'TRANSFORM CANNOT EXECUTE',
        'SQL Transform does not exist',
      );
      throw new BadRequestException('SQL Transform does not exist');
    }

    return sql;
  }

  async getProc(tables: string[]) {
    const result = {};
    // lấy sql của các bảng dimension
    await Promise.all(
      tables.map(async (table) => {
        let sql: unknown;
        if (
          // file tồn tại thì dọc dữ liệu của file
          fileExistsSync(`${process.env.PWD}/sqls/exec/dimension/${table}.sql`)
        ) {
          sql = await readFile(
            `${process.env.PWD}/sqls/exec/dimension/${table}.sql`,
          );
        }
        // nếu file chứa sql của bất kỳ dimension nào không tồn tại ghi log và trả về lỗi 400
        if (typeof sql !== 'string' || _.isEmpty(sql.trim())) {
          await this.logService.logEvent(
            null,
            'ERROR',
            `Missing procedure for dimension table: ${table}`,
            'Missing ERROR',
          );
          // trả về lỗi 400
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
    // xoá toàn bộ bảng staging_transform
    await this.dataSourceStaging.query('TRUNCATE staging_transform');
    let offset = 0;
    while (true) {
      // lặp qua từng nhóm 50 hàng trong bảng staging
      const data = await this.dataSourceStaging.query(
        `SELECT * FROM public.staging ORDER BY id OFFSET ${offset} LIMIT 50`,
      );
      if (data.length === 0) break;
      await Promise.all(
        // lặp qua từng hàng dữ liệu
        data.map(async (child) => {
          let cloneTransformSQL = transformSQL;
          // lặp qua từng tên bảng
          for (const table of tables) {
            // lấy câu sql của bảng
            const proc = procs[table];

            const columns = proc
              .match(/<([^>]+)>/g)
              .map((match) => match.slice(1, -1));
            let cloneProc: string = proc;
            // thay thế dữ liệu vào câu sql để chạy
            for (const column of columns) {
              cloneProc = cloneProc.replace(
                `<${column}>`,
                `${child[column] || 'NULL'}`,
              );
            }
            try {
              // chạy câu dữ liệu để upsert vào bảng dimension
              const results = await this.dataSource.query(cloneProc);
              // update dữ liệu của câu sql transform
              for (const field in results[0]) {
                cloneTransformSQL = cloneTransformSQL.replace(
                  `<${field}>`,
                  results[0][field] || 'NULL',
                );
              }
            } catch (error) {
              // nếu xảy ra bất kỳ lỗi nào tiến hành ngắt và chuyển sang cột dữ liệu tiếp theo
              await this.logService.logEvent(
                null,
                'WARNING',
                `LOAD TO DIMENSION IS MISSING: ${cloneProc}`,
                error.message,
              );

              return;
            }
          }
          // thực hiện insert dữ liệu không phải là dimension vào câu sql

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
            // thực hiện insert dữ liệu vào bảng staging transform
            await this.dataSourceStaging.query(cloneTransformSQL);
          } catch (error) {
            // nếu quá trình insert lỗi ghi log và trả về lỗi
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
