import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ExtractModule } from './extract/extract.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Staging } from './entities/staging.entity';
import { TransformModule } from './transform/transform.module';
@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017', {
      dbName: 'infodb',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'admin',
      database: 'staging_warehouse',
      entities: [Staging],
      synchronize: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'admin',
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
