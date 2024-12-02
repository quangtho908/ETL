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
    if (!fileExistsSync(`${process.env.PWD}/sqls/exec/data_warehouse.sql`)) {
      await this.logService.logEvent(
        null,
        'ERROR',
        'LOAD IS ERROR',
        'SQL Load not exists',
      );
      throw new BadRequestException('SQL Load not exists');
    }

    const sql = await readFile(
      `${process.env.PWD}/sqls/exec/data_warehouse.sql`,
    );
    if (_.isEmpty(sql) || typeof sql !== 'string') {
      await this.logService.logEvent(
        null,
        'ERROR',
        `LOAD IS ERROR: ${sql}`,
        'SQL Load is wrong',
      );
      throw new BadRequestException('SQL Load is wrong');
    }
    let offset = 0;
    while (true) {
      const products = await this.dataSourceStaging.query(
        `SELECT * FROM public.staging_transform ORDER BY id OFFSET ${offset} LIMIT 50`,
      );
      if (products.length === 0) break;
      const columns = sql
        .match(/<([^>]+)>/g)
        .map((match) => match.slice(1, -1));
      await Promise.all(
        products.map(async (product) => {
          let cloneSql = sql;
          for (const column of columns) {
            cloneSql = cloneSql.replace(
              `<${column}>`,
              product[column] || 'NULL',
            );
          }
          try {
            await this.dataSource.query(cloneSql);
          } catch (error) {
            await this.logService.logEvent(
              null,
              'Warning',
              `LOAD TO WAREHOUSE IS MISSING: ${cloneSql}`,
              error.message,
            );
          }
        }),
      );
      offset += 50;
    }
    await this.logService.logEvent(
      null,
      'SUCCESSFULLY',
      `LOAD TO WAREHOUSE SUCCESS`,
      '',
    );
  }
}
