import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Config, ConfigSchema } from 'src/schema/config.schema';
import { ExtractService } from './extract.service';
import { Log, LogSchema } from 'src/schema/log.schema';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Staging } from 'src/entities/staging.entity';
import { CleanService } from './clean.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Config.name, schema: ConfigSchema },
      {
        name: Log.name,
        schema: LogSchema,
      },
    ]),
    TypeOrmModule.forFeature([Staging]),
  ],
  providers: [ExtractService, CleanService],
  exports: [ExtractService, CleanService],
})
export class ExtractModule {}
