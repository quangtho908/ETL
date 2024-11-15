import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { InjectModel } from '@nestjs/mongoose';
import { Config } from '../schema/config.schema';
import { Model } from 'mongoose';
import { Log } from '../schema/log.schema';
import { readFile } from '../utils';
import * as process from 'node:process';
import { fileExistsSync } from 'tsconfig-paths/lib/filesystem';

@Injectable()
export class TransformService {
  private configs: Config[];

  constructor(
    @InjectDataSource('data_warehouse')
    private dataSource: DataSource,
    @InjectDataSource()
    private dataSourceStaging: DataSource,
    @InjectModel(Config.name) private configModel: Model<Config>,
    @InjectModel(Log.name) private logModel: Model<Log>,
  ) {}

  async getConfig() {
    const configsList = await this.configModel.find({});
    this.configs = configsList.filter(
      (configData) =>
        (configData.mapExtract !== null || configData.url !== null) &&
        configData.enable,
    );
  }

  async start() {
    const tables = await this.getTables();
    const [transfromSQL, procs] = await Promise.all([
      this.getTransformSQL(),
      this.getProc(tables),
    ]);
    await this.transform(procs, tables, transfromSQL.toString());
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
    return await readFile(`${process.env.PWD}/sqls/exec/staging/transform.sql`);
  }

  async getProc(tables: string[]) {
    const result = {};
    await Promise.all(
      tables.map(async (table) => {
        if (
          fileExistsSync(`${process.env.PWD}/sqls/exec/dimension/${table}.sql`)
        ) {
          result[table] = await readFile(
            `${process.env.PWD}/sqls/exec/dimension/${table}.sql`,
          );
        }
      }),
    );
    return result;
  }

  async transform(
    procs: { [fieldName: string]: string },
    tables: string[],
    transformSQL: string,
  ) {
    await this.dataSourceStaging.query('TRUNCATE staging_transform');
    let offset = 0;
    while (true) {
      const data = await this.dataSourceStaging.query(
        `SELECT * FROM public.staging ORDER BY id OFFSET ${offset} LIMIT 50`,
      );
      if (data.length === 0) break;
      Promise.all(
        data.map(async (child) => {
          let cloneTransformSQL = transformSQL;
          for (const table of tables) {
            const proc = procs[table];

            if (!!proc) {
              const columns = proc
                .match(/<([^>]+)>/g)
                .map((match) => match.slice(1, -1));
              let cloneProc: string = proc;
              for (const column of columns) {
                cloneProc = cloneProc.replace(
                  `<${column}>`,
                  `${child[column] || 'NULL'}`,
                );
              }
              const results = await this.dataSource.query(cloneProc);
              for (const field in results[0]) {
                cloneTransformSQL = cloneTransformSQL.replace(
                  `<${field}>`,
                  results[0][field] || 'NULL',
                );
              }
            }
          }
          const columns = cloneTransformSQL
            .match(/<([^>]+)>/g)
            .map((match) => match.slice(1, -1));
          for (const column of columns) {
            cloneTransformSQL = cloneTransformSQL.replace(
              `<${column}>`,
              `${child[column] || 'NULL'}`,
            );
          }

          this.dataSourceStaging.query(cloneTransformSQL);
        }),
      );
      offset += 50;
    }
  }
}
