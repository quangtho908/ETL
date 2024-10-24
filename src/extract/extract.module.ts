import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Config, ConfigSchema } from "src/schema/config.schema";
import { ExtractService } from "./extract.service";
import { Log, LogSchema } from "src/schema/log.schema";

@Module({
  imports: [MongooseModule.forFeature([
    {name: Config.name, schema: ConfigSchema},
    {name: Log.name, schema: LogSchema}
  ])],
  providers: [ExtractService],
  exports: [ExtractService]
})
export class ExtractModule {}