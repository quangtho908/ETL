// src/services/clean2.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner } from 'typeorm';
import { Staging } from 'src/entities/staging.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class Clean2Service {
  constructor(
    @InjectRepository(Staging)
    private stagingRepo: Repository<Staging>,
  ) {}
  async clean2() {
    const queryRunner = this.stagingRepo.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const sqlFilePath = path.join(process.cwd(), 'sqls', 'cleanStagging.sql');
      const sql = fs.readFileSync(sqlFilePath, 'utf-8');
      await queryRunner.query(sql);
      await queryRunner.commitTransaction();
      console.log('Dữ liệu đã được làm sạch thành công bằng Clean2Service.');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Đã xảy ra lỗi trong quá trình làm sạch dữ liệu:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
