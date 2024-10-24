import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { link, writeFileSync } from 'fs';
import { Model, Types } from 'mongoose';
import { Config } from 'src/schema/config.schema';
import { Log } from 'src/schema/log.schema';

@Injectable()
export class ExtractService {
  private configs: Config[];
  constructor(
    @InjectModel(Config.name) private configModel: Model<Config>,
    @InjectModel(Log.name) private logModel: Model<Log>,
  ) {}

  async getConfig() {
    const configsList = await this.configModel.find({});
    this.configs = configsList.filter(
      (configData) =>
        (configData.mapExtract !== null || configData.url !== null) &&
        configData.enable,
    );
  }

  async extract() {
    await this.getConfig();
    for (let config of this.configs) {
      const products = await this.fetchLinks(config);
      const chunkSize = 10;
      const allProductsDetails = [];
      for (let i = 0; i < products.length; i += chunkSize) {
        const chunk = products.slice(i, i + chunkSize);
        const productsDetails = await Promise.all(
          chunk.map((product) => this.getProductDetails(product.link, config, {
            name: product.name,
            pricing: product.pricing
          })),
        );

        allProductsDetails.push(...productsDetails);
      }

      writeFileSync(
        config.file,
        JSON.stringify(allProductsDetails, null, 2),
        'utf-8',
      );
    }
  }

  async getProductDetails(link, config: Config, product) {
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
          details[mapKey[name]] = value;
        });
        return;
      }
      details[q.name] = $(q.value).text().trim();
    });
    return {...details, ...product};
  }

  async fetchLinks(config: Config) {
    const url = `${config.url}${config.path}${config.params}`;
    const headers = JSON.parse(config.headers);
    let pageIndex = 0;
    let links = [];
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
        const patch: {link: string, name: string, pricing: string} = {
          link: '',
          name: '',
          pricing: ''
        }
        $(config.queryUrlDetail).each((_index, element) => {
          const href = $(element).attr('href');
          if(href) {
            patch.name = $(element).find(config.queryName).text().trim();
            patch.pricing = $(element).find(config.queryPricing).text().trim();
            patch.link = `${config.url}${href}`
            result.push(patch)
          };
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
    return result
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