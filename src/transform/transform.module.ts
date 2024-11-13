import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransformService } from './transform.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Config, ConfigSchema } from '../schema/config.schema';
import { Log, LogSchema } from '../schema/log.schema';
import { Staging } from '../entities/staging.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Config.name, schema: ConfigSchema },
      {
        name: Log.name,
        schema: LogSchema,
      },
    ]),
    TypeOrmModule.forFeature([], 'data_warehouse'),
    TypeOrmModule.forFeature([Staging]),
  ],
  providers: [TransformService],
  exports: [TransformService],
})
export class TransformModule {}
