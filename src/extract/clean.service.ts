import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Model, Types } from 'mongoose';
import { Staging } from 'src/entities/staging.entity';
import { Config } from 'src/schema/config.schema';
import { Log } from 'src/schema/log.schema';
import { readFile } from 'src/utils';
import { DataSource, Repository } from 'typeorm';
import * as process from 'node:process';
import { LogService } from '../log/log.service';

@Injectable()
export class CleanService {
  constructor(
    @InjectModel(Config.name) private configModel: Model<Config>,
    @InjectDataSource() private dataSourceStaging: DataSource,
    @InjectRepository(Staging) private stagingRepo: Repository<Staging>,
    private logService: LogService,
  ) {}

  async clean() {
    const sql = await readFile(process.env.PWD + '/sqls/cleanStaging.sql');

    if (typeof sql === 'string') {
      try {
        await this.dataSourceStaging.query(sql);
      } catch (error) {
        await this.logService.logEvent(
          null,
          'ERROR',
          'CLEAN STAGING NOT COMPLETED',
          error.message,
        );
        throw new BadRequestException(error);
      }
    }
  }
}
