import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { createWriteStream, rmSync } from 'fs';
import { Model, Types } from 'mongoose';
import { Staging } from 'src/entities/staging.entity';
import { Config } from 'src/schema/config.schema';
import { Log } from 'src/schema/log.schema';
import { Repository } from 'typeorm';
import { json2csv } from 'json-2-csv';
import * as process from 'node:process';
import { readFile } from '../utils';

@Injectable()
export class ExtractService {
  private configs: Config[];

  constructor(
    @InjectModel(Config.name) private configModel: Model<Config>,
    @InjectModel(Log.name) private logModel: Model<Log>,
    @InjectRepository(Staging) private stagingRepo: Repository<Staging>,
  ) {}
  // 1.1 Load dữ liệu từ config
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
    for (const config of this.configs) {
      // 1.2 Ghi log bắt đầu chạy config
      await this.logEvent(
        config._id,
        'Started',
        'Crawl started',
        'Starting data extraction process.',
      );
      // 1.3 Lấy tất cả đường dẫn chi tiết sản phẩm
      const products = await this.fetchLinks(config);
      const chunkSize = 10;
      const allProductsDetails = [];
      let id = 1;
      // 1.6 Lấy dữ liệu chi tiết từng sản phẩm
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
      // 1.7 Lưu dữ liệu vào file csv
      rmSync(`extracts_data/${config.file}`, { force: true });
      const writeStream = createWriteStream(`extracts_data/${config.file}`);
      const csv = json2csv(allProductsDetails);

      writeStream.write(csv);
      writeStream.on('close', async () => {
        // 2.1 Load dữ liệu từ file csv lên stagging
        await this.loadToStaging(config.name);
      });
    }
  }
  // 1.3 Lấy tất cả đường dẫn chi tiết sản phẩm
  async fetchLinks(config: Config) {
    const url = `${config.url}${config.path}${config.params}`;
    const headers = JSON.parse(config.headers);
    let pageIndex = 0;
    const result = [];
    while (true) {
      try {
        // 1.4 Ghi log đang xử lý
        await this.logEvent(
          config._id,
          'In Progress',
          'Fetching page',
          `Fetching page index ${pageIndex}`,
        );
        const response = await axios({
          url: url + pageIndex,
          method: config.methodList,
          headers,
          data: config.bodyList,
        });
        const html = response.data.listproducts;
        if (!html || html.trim() === '') {
          // 1.5 Không lỗi : Ghi log hoàn thành lấy danh sách link chi tiết sản phẩm
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
        // 1.5 Có lỗi : Ghi log lỗi khi lấy dữ liệu
        await this.logEvent(
          config._id,
          'Error',
          'Error fetching data',
          `Error fetching data at page index ${pageIndex}: ${error.message}`,
        );
        console.error('Error fetching data:', error);
        break;
      }
    }
    return result;
  }

  async loadToStaging(name: string) {
    const sql = await readFile(process.env.PWD + `/sqls/${name}.sql`);
    await this.stagingRepo.clear();
    if (typeof sql === 'string') {
      await this.stagingRepo.query(sql);
    }
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