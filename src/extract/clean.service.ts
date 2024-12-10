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
  // 1. Khởi tạo quy trình clean()
  async clean() {
    // 2. Đọc tệp cleanStagging.sql để lấy sql làm sạch dữ liệu
    // 3. kiểm tra file tồn tại
    if (!fileExistsSync(`${process.env.PWD}/sqls/cleanStaging.sql`)) {
      // 3.1 Ghi Log lỗi
      await this.logService.logEvent(
        null,
        'ERROR',
        'CLEAN CANNOT EXECUTE',
        'SQL CLEAN does not exist',
      );
      // 3.2 Response Error Status code: 400
      throw new BadRequestException('SQL does not exist');
    }
    const sql = await readFile(process.env.PWD + '/sqls/cleanStaging.sql');
    if (typeof sql === 'string') {
      try {
        // 4. Thực thi câu lệnh SQL làm sạch dữ liệu trong cơ sở dữ liệu
        await this.dataSourceStaging.query(sql);
        // 5 > Không có lỗi
        // 6. Response Successfully Status code 200
        return {
          statusCode: 200,
        };
      } catch (error) {
        // 5.1 Ghi Log lỗi
        await this.logService.logEvent(
          null,
          'ERROR',
          'CLEAN STAGING NOT COMPLETED',
          error.message,
        );
        // 6.1 Response Error Status code: 400
        throw new BadRequestException(error);
      }
    }
  }
}
