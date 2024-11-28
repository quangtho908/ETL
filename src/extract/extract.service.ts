import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { createWriteStream, rmSync } from 'fs';
import { Model, Types } from 'mongoose';
import { Staging } from 'src/entities/staging.entity';
import { Config } from 'src/schema/config.schema';
import { Log } from 'src/schema/log.schema';
import { DataSource, Repository } from 'typeorm';
import { json2csv } from 'json-2-csv';
import * as process from 'node:process';
import { directusCreateFolder, directusUploadFile, readFile } from '../utils';
import * as _ from 'lodash';

@Injectable()
export class ExtractService {
  private configs: Config[];

  constructor(
    @InjectModel(Config.name) private configModel: Model<Config>,
    @InjectModel(Log.name) private logModel: Model<Log>,
    @InjectRepository(Staging) private stagingRepo: Repository<Staging>,
    @InjectDataSource() private dataSourceStaging: DataSource,
  ) {}

  async getConfig() {
    const configsList = await this.configModel.find({});
    if (!_.isEmpty(this.configs)) return;
    this.configs = configsList.filter(
      (configData) =>
        (configData.mapExtract !== null || configData.url !== null) &&
        configData.enable,
    );
  }

  async extract() {
    await this.getConfig();
    let id = 1;
    const folderId = await directusCreateFolder(
      'c461424e-297f-4b59-9806-68b414b09700',
      new Date().toLocaleDateString(),
    );
    for (const config of this.configs) {
      try {
        const products = await this.fetchLinks(config);
        const chunkSize = 10;
        const allProductsDetails = [];
        for (let i = 0; i < products.length; i += chunkSize) {
          const chunk = products.slice(i, i + chunkSize);
          const productsDetails = await Promise.all(
            chunk.map((product) =>
              this.getProductDetails(product.link, config, {
                id: id++,
                name: product.name,
                pricing: product.pricing,
              }),
            ),
          );
          allProductsDetails.push(...productsDetails);
        }
        rmSync(`${process.env.PWD}/extracts_data/${config.file}`, {
          force: true,
        });
        const writeStream = createWriteStream(
          `${process.env.PWD}/extracts_data/${config.file}`,
        );
        const csv = json2csv(allProductsDetails);
        writeStream.write(csv, async () => {
          await directusUploadFile(
            `${process.env.PWD}/extracts_data/${config.file}`,
            folderId,
          );
        });
      } catch (error) {
        await this.logEvent(
          config._id,
          'WARNING',
          `EXTRACT ERROR: ${config.name}`,
          error.message,
        );
      }
    }
    await this.logEvent(null, 'SUCCESSFULLY', 'EXTRACT DONE', '');
  }

  async loadToStaging() {
    await this.getConfig();
    await this.stagingRepo.clear();
    const sql = await readFile(
      `${process.env.PWD}/sqls/loadToStaging/loadToStaging.sql`,
    );
    for (const config of this.configs) {
      if (typeof sql === 'string') {
        let cloneSQL = sql;
        cloneSQL = cloneSQL.replace('<path>', `/extracts_data/${config.file}`);
        try {
          await this.dataSourceStaging.query(cloneSQL);
        } catch (error) {
          await this.logEvent(
            config._id,
            'WARNING',
            `MISSING IMPORT TO STAGING: ${config.name}`,
            error.message,
          );
        }
      }
    }

    await this.logEvent(null, 'SUCCESSFULLY', 'LOAD TO STAGING DONE', '');
  }

  async getProductDetails(
    link: string,
    config: Config,
    product: { name: any; id: number; pricing: any },
  ) {
    const { data } = await axios.get(link);
    const $ = cheerio.load(data);
    const details = {};
    const query = JSON.parse(config.query);
    const mapKey = JSON.parse(config.mapExtract);
    query.forEach((q) => {
      if (q.type === 'common') {
        $(q.parent).each((_index, element) => {
          const name = $(element).find(q.name).text().trim();
          let value = $(element).find(q.value).text().trim();
          value = value.replace(/\n\s{52}/g, '_');
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          mapKey[name] && (details[mapKey[name]] = value);
        });
        return;
      }
    });
    return this.stagingRepo.create({ ...product, ...details });
  }

  async fetchLinks(config: Config) {
    const url = `${config.url}${config.path}${config.params}`;
    const headers = JSON.parse(config.headers);
    let pageIndex = 0;
    const result = [];
    while (true) {
      try {
        const response = await axios({
          url: url + pageIndex,
          method: config.methodList,
          headers,
          data: config.bodyList,
        });
        const html = response.data.listproducts;
        if (!html || html.trim() === '') {
          await this.logEvent(
            config._id,
            'Completed',
            'No more data to fetch',
            `Completed at page index ${pageIndex}`,
          );
          break;
        }
        const $ = cheerio.load(html);
        $(config.queryUrlDetail).each((_index, element) => {
          const href = $(element).attr('href');
          if (href) {
            result.push({
              name: $(element).find(config.queryName).text().trim(),
              pricing: $(element).find(config.queryPricing).text().trim(),
              link: `${config.url}${href}`,
            });
          }
        });
        pageIndex++;
      } catch (error) {
        await this.logEvent(
          config._id,
          'Error',
          'Error fetching data',
          error.message,
        );
        console.error('Error fetching data:', error);
        break;
      }
    }
    return result;
  }

  async logEvent(
    configId: Types.ObjectId,
    status: string,
    message: string,
    details: string,
  ) {
    const logEntry = new this.logModel({
      configId,
      timestamp: new Date(),
      status,
      message,
      details,
    });
    await logEntry.save();
  }
}
