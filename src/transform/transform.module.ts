import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransformService } from './transform.service';
import { Staging } from '../entities/staging.entity';
import { LogModule } from '../log/log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([], 'data_warehouse'),
    TypeOrmModule.forFeature([Staging]),
    LogModule,
  ],
  providers: [TransformService],
  exports: [TransformService],
})
export class TransformModule {}
