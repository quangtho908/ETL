import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Model } from 'mongoose';
import { Staging } from 'src/entities/staging.entity';
import { Config } from 'src/schema/config.schema';
import { readFile } from 'src/utils';
import { DataSource, Repository } from 'typeorm';
import * as process from 'node:process';
import { LogService } from '../log/log.service';
import { fileExistsSync } from 'tsconfig-paths/lib/filesystem';

@Injectable()
export class CleanService {
  constructor(
    @InjectModel(Config.name) private configModel: Model<Config>,
    @InjectDataSource() private dataSourceStaging: DataSource,
    @InjectRepository(Staging) private stagingRepo: Repository<Staging>,
    private logService: LogService,
  ) {}

  async clean() {
    if (!fileExistsSync(`${process.env.PWD}/sqls/cleanStaging.sql`)) {
      await this.logService.logEvent(
        null,
        'ERROR',
        'CLEAN CANNOT EXECUTE',
        'SQL CLEAN does not exist',
      );
      throw new BadRequestException('SQL does not exist');
    }
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
