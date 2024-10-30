import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Model } from 'mongoose';
import { Staging } from 'src/entities/staging.entity';
import { Config } from 'src/schema/config.schema';
import { Log } from 'src/schema/log.schema';
import { cleanAction, readFile } from 'src/utils';
import { Repository } from 'typeorm';
import * as process from 'node:process';

@Injectable()
export class CleanService {
  constructor(
    @InjectModel(Config.name) private configModel: Model<Config>,
    @InjectModel(Log.name) private logModel: Model<Log>,
    @InjectRepository(Staging) private stagingRepo: Repository<Staging>,
  ) {}

  async clean(id: string) {
    const config = await this.configModel.findById(id);
    const cleanOptions = JSON.parse(config.cleanOptions);
    const sql = await readFile(process.env.PWD + '/sqls/queryStaging.sql');
    if (typeof sql !== 'string') {
      return;
    }
    const products = await this.stagingRepo.query(sql);
    products.forEach((product) => {
      cleanOptions.forEach(
        (cleanOpt: { action: { [x: string]: any }; attr: string | number }) => {
          for (const action in cleanOpt.action) {
            const newData = cleanAction[action](
              product,
              cleanOpt.attr,
              cleanOpt.action[action],
            );
            if (cleanOpt.attr) {
              product[cleanOpt.attr] = newData.trim();
            }
          }
        },
      );
    });

    await this.stagingRepo.save(products);
  }
}
