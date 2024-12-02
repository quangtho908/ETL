import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Staging } from '../entities/staging.entity';
import { LoadService } from './load.service';
import { LogModule } from '../log/log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([], 'data_warehouse'),
    TypeOrmModule.forFeature([Staging]),
    LogModule,
  ],
  providers: [LoadService],
  exports: [LoadService],
})
export class LoadModule {}
