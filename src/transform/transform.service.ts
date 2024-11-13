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
    const [querys, columns, procs] = await Promise.all([
      this.getSql(tables),
      this.getColumns(tables),
      this.getProc(tables),
    ]);
    await this.transform(querys, columns, procs, tables);
  }

  async getTables() {
    const tables = await this.dataSource.query(
      "select table_name from information_schema.tables where table_schema = 'public'",
    );
    return tables
      .map((table: { table_name: any }) => table.table_name)
      .filter((name) => name !== 'phone_table');
  }

  async getColumns(tables: string[]) {
    const result = {};
    for (const tableName of tables) {
      if (tableName === 'phone_table') continue;
      const columns = await this.dataSource.query(
        `SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = '${tableName}';`,
      );
      result[tableName] = columns
        .map((column: { column_name: any }) => column.column_name)
        .filter((column: string) => column !== 'id');
    }
    return result;
  }

  async getSql(tables: string[]) {
    const result = {};
    await Promise.all(
      tables.map(async (table) => {
        if (
          fileExistsSync(`${process.env.PWD}/sqls/dimension_query/${table}.sql`)
        ) {
          result[table] = await readFile(
            `${process.env.PWD}/sqls/dimension_query/${table}.sql`,
          );
        }
      }),
    );
    return result;
  }

  async getProc(tables: string[]) {
    const result = {};
    await Promise.all(
      tables.map(async (table) => {
        if (
          fileExistsSync(`${process.env.PWD}/sqls/dimension_proc/${table}.sql`)
        ) {
          result[table] = await readFile(
            `${process.env.PWD}/sqls/dimension_proc/${table}.sql`,
          );
        }
      }),
    );
    return result;
  }

  async transform(
    querys: { [fieldName: string]: string },
    columns: { [fieldName: string]: string[] },
    procs: { [fieldName: string]: string },
    tables: string[],
  ) {
    let offset = 0;
    while (true) {
      const data = await this.dataSourceStaging.query(
        `SELECT * FROM public.staging ORDER BY id OFFSET ${offset} LIMIT 50`,
      );
      if (data.length === 0) break;
      Promise.all(
        data.map(async (child) => {
          for (const table of tables) {
            const query = querys[table];
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
              const result = await this.dataSource.query(cloneProc);
            }
          }
        }),
      );
      offset += 50;
    }
  }
}
