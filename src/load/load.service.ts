import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { fileExistsSync } from 'tsconfig-paths/lib/filesystem';
import * as process from 'node:process';
import { LogService } from '../log/log.service';
import { readFile } from '../utils';
import * as _ from 'lodash';

@Injectable()
export class LoadService {
  constructor(
    @InjectDataSource('data_warehouse')
    private dataSource: DataSource,
    @InjectDataSource()
    private dataSourceStaging: DataSource,
    private logService: LogService,
  ) {}

  public async load() {
    // 3. Đọc file sqls/exec/staging/transform.sql để lấy sql transform
    if (!fileExistsSync(`${process.env.PWD}/sqls/exec/data_warehouse.sql`)) {
      // 3.1 Ghi log báo lỗi nếu file sql load không tồn tại
      await this.logService.logEvent(
        null,
        'ERROR',
        'LOAD IS ERROR',
        'SQL Load not exists',
      );
      // 3.2 Trả về response error status code 400 BadRequestException
      throw new BadRequestException('SQL Load not exists');
    }
    // file tồn tại đọc file
    const sql = await readFile(
      `${process.env.PWD}/sqls/exec/data_warehouse.sql`,
    );
    // dữ liệu file trống ghi log lỗi và trả về lỗi 400
    if (typeof sql !== 'string' || _.isEmpty(sql.trim())) {
      await this.logService.logEvent(
        null,
        'ERROR',
        `LOAD IS ERROR: ${sql}`,
        'SQL Load is wrong',
      );
      throw new BadRequestException('SQL Load is wrong');
    }
    let offset = 0;
    // 3.2 Thực hiện load
    while (true) {
      // 4. Chia dữ liệu staging_transform thành từng nhóm 50 dòng dữ liệu
      // 4.1 Duyệt qua từng nhóm dữ liệu (50 dòng)
      const products = await this.dataSourceStaging.query(
        `SELECT * FROM public.staging_transform ORDER BY id OFFSET ${offset} LIMIT 50`,
      );
      if (products.length === 0) break;
      const columns = sql
        .match(/<([^>]+)>/g)
        .map((match) => match.slice(1, -1));
      await Promise.all(
        // 5. Lặp qua từng bản ghi
        products.map(async (product) => {
          let cloneSql = sql;
          for (const column of columns) {
            // 5.1 Thay thế các giá trị vào sql  load
            cloneSql = cloneSql.replace(
              `<${column}>`,
              product[column] || 'NULL',
            );
          }
          try {
            // 5.2 chèn dữ liệu mới vào bảng phone_table
            await this.dataSource.query(cloneSql);
          } catch (error) {
            // 5.3 Ghi log cảnh báo nếu xảy ra lỗi
            await this.logService.logEvent(
              null,
              'WARNING',
              `LOAD TO WAREHOUSE IS MISSING: ${cloneSql}`,
              error.message,
            );
          }
        }),
      );
      offset += 50;
    }
    // 6. Ghi log thành công
    await this.logService.logEvent(
      null,
      'SUCCESSFULLY',
      `LOAD TO WAREHOUSE SUCCESS`,
      '',
    );
  }
}
