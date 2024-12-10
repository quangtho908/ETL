import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ExtractModule } from './extract/extract.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Staging } from './entities/staging.entity';
import { TransformModule } from './transform/transform.module';
import { LoadModule } from './load/load.module';
import { LogModule } from './log/log.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017', {
      dbName: 'infodb',
    }),
<<<<<<< HEAD
    ServeStaticModule.forRoot({
      rootPath: join(process.env.PWD || process.cwd(), 'extracts_data'),
    }),
=======
>>>>>>> 6c22b5771863c04ee01dff7936104cb931227b66
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
    LoadModule,
    LogModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
