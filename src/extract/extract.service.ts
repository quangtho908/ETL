import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { createWriteStream, rmSync } from 'fs';
import { Model } from 'mongoose';
import { Staging } from 'src/entities/staging.entity';
import { Config } from 'src/schema/config.schema';
import { DataSource, Repository } from 'typeorm';
import { json2csv } from 'json-2-csv';
import * as process from 'node:process';
import { directusUploadFile, readFile } from '../utils';
import * as _ from 'lodash';
import { LogService } from '../log/log.service';
import { fileExistsSync } from 'tsconfig-paths/lib/filesystem';

@Injectable()
export class ExtractService {
  private configs: Config[];

  constructor(
    @InjectModel(Config.name) private configModel: Model<Config>,
    @InjectRepository(Staging) private stagingRepo: Repository<Staging>,
    @InjectDataSource() private dataSourceStaging: DataSource,
    private logService: LogService,
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
    // đọc config từ mongodb
    await this.getConfig();
    let id = 1;
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
            'd408c41c-b225-4b6d-ab35-90c43d935d3a',
          );
        });
      } catch (error) {
        await this.logService.logEvent(
          config._id,
          'WARNING',
          `EXTRACT ERROR: ${config.name}`,
          error.message,
        );
      }
    }
    await this.logService.logEvent(null, 'SUCCESSFULLY', 'EXTRACT DONE', '');
  }

  async loadToStaging() {
    await this.getConfig();
    await this.stagingRepo.clear();
    if (
      !fileExistsSync(`${process.env.PWD}/sqls/loadToStaging/loadToStaging.sql`)
    ) {
      await this.logService.logEvent(
        null,
        'ERROR',
        'LOAD TO STAGING CANNOT EXECUTE',
        'SQL Transform does not exist',
      );
      throw new BadRequestException('SQL does not exist');
    }
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
          await this.logService.logEvent(
            config._id,
            'WARNING',
            `MISSING IMPORT TO STAGING: ${config.name}`,
            error.message,
          );
        }
      }
    }

    await this.logService.logEvent(
      null,
      'SUCCESSFULLY',
      'LOAD TO STAGING DONE',
      '',
    );
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
          await this.logService.logEvent(
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
        await this.logService.logEvent(
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
}
