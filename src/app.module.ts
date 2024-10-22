import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ExtractModule } from './extract/extract.module';

@Module({
  imports: [
    MongooseModule.forRoot("mongodb://localhost:27017", {
      dbName: "infodb"
    }),
    ExtractModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
