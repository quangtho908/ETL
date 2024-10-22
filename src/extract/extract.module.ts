import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Config, ConfigSchema } from "src/schema/config.schema";
import { ExtractService } from "./extract.service";

@Module({
  imports: [MongooseModule.forFeature([{name: Config.name, schema: ConfigSchema}])],
  providers: [ExtractService],
  exports: [ExtractService]
})
export class ExtractModule {}