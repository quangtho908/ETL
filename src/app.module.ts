import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ExtractModule } from './extract/extract.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Staging } from './entities/staging.entity';
import { TransformModule } from './transform/transform.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as process from 'node:process';
import { join } from 'path';
@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017', {
      dbName: 'infodb',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.env.PWD || process.cwd(), 'extracts_data'),
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '123456',
      database: 'staging_warehouse',
      entities: [Staging],
      synchronize: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '123456',
      database: 'data_warehouse',
      name: 'data_warehouse',
    }),
    ExtractModule,
    TransformModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
