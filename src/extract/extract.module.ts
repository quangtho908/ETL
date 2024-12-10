import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Config, ConfigSchema } from 'src/schema/config.schema';
import { ExtractService } from './extract.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Staging } from 'src/entities/staging.entity';
import { CleanService } from './clean.service';
import { LogModule } from '../log/log.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Config.name, schema: ConfigSchema }]),
    TypeOrmModule.forFeature([Staging]),
    LogModule,
  ],
  providers: [ExtractService, CleanService],
  exports: [ExtractService, CleanService],
})
export class ExtractModule {}
