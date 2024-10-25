import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { InjectRepository } from "@nestjs/typeorm";
import { attr } from "cheerio/dist/commonjs/api/attributes";
import { Model } from "mongoose";
import { Staging } from "src/entities/staging.entity";
import { Config } from "src/schema/config.schema";
import { Log } from "src/schema/log.schema";
import { cleanAction } from "src/utils";
import { Repository } from "typeorm";

@Injectable()
export class CleanService {
  constructor(
    @InjectModel(Config.name) private configModel: Model<Config>,
    @InjectModel(Log.name) private logModel: Model<Log>,
    @InjectRepository(Staging) private stagingRepo: Repository<Staging>
  ) {}

  async clean(id: string) {
    const config = await this.configModel.findById(id)
    const cleanOptions = JSON.parse(config.cleanOptions)
    const products = await this.stagingRepo.find({})
    products.forEach((product) => {
      cleanOptions.forEach(cleanOpt => {
        for(let action in cleanOpt.action) {
          const newData = cleanAction[action](product, cleanOpt.attr, cleanOpt.action[action])
          product[cleanOpt.attr] = newData.trim()
        }
      })
    })

    this.stagingRepo.save(products)
  }
}