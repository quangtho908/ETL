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

  //1. Khởi tạo quy trình extract()
  async extract() {
    // 2. Lấy danh sách cấu hình từ CSDL getConfig()
    await this.getConfig();
    let id = 1;
    // 3. Lặp qua từng cấu hình trong this.configs
    // 4. Còn config không?
    for (const config of this.configs) {
      // 4 > Có
      try {
        // 4.1. Lấy danh sách sản phẩm từ liên kết fetchLinks(config)
        const products = await this.fetchLinks(config);
        const chunkSize = 10;
        const allProductsDetails = [];
        // 5. Chia nhỏ các sản phẩm thành các chunk
        // 6. Còn sản phẩm trong chunk ?
        for (let i = 0; i < products.length; i += chunkSize) {
          // 6 > Có
          const chunk = products.slice(i, i + chunkSize);
          // 6.1 Tạo Promise.all để lấy tất cả chi tiết sản phẩm
          const productsDetails = await Promise.all(
            chunk.map((product) =>
              // 6.2. Lấy chi tiết sản phẩm từ liên kết getProductDetails(link,config,product)
              this.getProductDetails(product.link, config, {
                id: id++,
                name: product.name,
                pricing: product.pricing,
              }),
            ),
          );
          // 6.3. Thêm danh sách chi tiết sản phẩm vào danh sách allProductsDetails
          allProductsDetails.push(...productsDetails);
        }
        // 6 > Không
        // 7. Xóa file cũ và lưu file mới dưới dạng CSV
        rmSync(`${process.env.PWD}/${config.file}`, {
          force: true,
        });
        const writeStream = createWriteStream(
          `${process.env.PWD}/${config.file}`,
        );
        const csv = json2csv(allProductsDetails);

        // 8. Upload file lên Directus
        writeStream.write(csv, async () => {
          await directusUploadFile(
            `${process.env.PWD}/${config.file}`,
            'd408c41c-b225-4b6d-ab35-90c43d935d3a',
          );
        });
      } catch (error) {
        // 9. Lỗi
        // 9.1 Ghi log "EXTRACT ERROR" kèm tên config
        await this.logService.logEvent(
          config._id,
          'WARNING',
          `EXTRACT ERROR: ${config.name}`,
          error.message,
        );
      }
    }
    // 4 > Không
    // 4.1. Ghi log với nội dung "EXTRACT DONE"
    await this.logService.logEvent(null, 'SUCCESSFULLY', 'EXTRACT DONE', '');
    // 4.2 Trả về statusCode 200
    return {
      statusCode: 200,
    };
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
    // 4.1.1 Lấy tham số url, headers,.. từ config để call API
    const url = `${config.url}${config.path}${config.params}`;
    const headers = JSON.parse(config.headers);
    let pageIndex = 0;
    const result = [];
    while (true) {
      try {
        // 4.1.2 Gọi axios lấy dữ liệu html theo từ pageIndex (ban đầu là 0)
        const response = await axios({
          url: url + pageIndex,
          method: config.methodList,
          headers,
          data: config.bodyList,
        });
        const html = response.data.listproducts;
        // 4.1.3 Có html trả về hay không?
        if (!html || html.trim() === '') {
          // 4.1.3 > Không
          // 4.1.4 Ghi log "No more data to fetch"
          await this.logService.logEvent(
            config._id,
            'Completed',
            'No more data to fetch',
            `Completed at page index ${pageIndex}`,
          );
          break;
        }

        const $ = cheerio.load(html);
        // 4.1.4 Lặp qua các config.queryUrlDetail
        $(config.queryUrlDetail).each((_index, element) => {
          // 4.1.5 Lấy href của sản phẩm
          const href = $(element).attr('href');
          // 4.1.6 Có href hay không?
          if (href) {
            // 4.1.7 Thêm name,pricing,link của sản phẩm vào mảng kết quả
            result.push({
              name: $(element).find(config.queryName).text().trim(),
              pricing: $(element).find(config.queryPricing).text().trim(),
              link: `${config.url}${href}`,
            });
          }
        });
        // 4.1.8 Tăng pageIndex lên 1
        pageIndex++;
      } catch (error) {
        // 4.1.10 Ghi log lỗi "Error fetching data"
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

  // ĐÂY LÀ CỦA PHẦN LOAD TO STAGING
  async loadToStaging() {
    // 1. Lấy danh sách cấu hình bằng hàm getConfig()
    await this.getConfig();
    // 2. Xóa dữ liệu cũ trong staging
    await this.stagingRepo.clear();
    // 3. Có file loadToStaging.sql không?
    if (
      !fileExistsSync(`${process.env.PWD}/sqls/loadToStaging/loadToStaging.sql`)
    ) {
      // 3.1 Ghi log "LOAD TO STAGING CANNOT EXECUTE"
      await this.logService.logEvent(
        null,
        'ERROR',
        'LOAD TO STAGING CANNOT EXECUTE',
        'SQL Transform does not exist',
      );
      // 3.2. Trả về status 400
      throw new BadRequestException('SQL does not exist');
    }
    // 4. Đọc tệp SQL loadToStaging.sql
    const sql = await readFile(
      `${process.env.PWD}/sqls/loadToStaging/loadToStaging.sql`,
    );
    // 5. Lặp qua từng cấu hình trong this.configs
    for (const config of this.configs) {
      // 5 > Có
      if (typeof sql === 'string') {
        let cloneSQL = sql;
        // 5.1 Thay thế <path> trong câu SQL bằng đường dẫn của config
        cloneSQL = cloneSQL.replace('<path>', config.file);
        try {
          // 5.2 Thực thi câu lệnh SQL với dataSourceStaging
          await this.dataSourceStaging.query(cloneSQL);
        } catch (error) {
          // 5.3 Ghi log lỗi
          await this.logService.logEvent(
            config._id,
            'WARNING',
            `MISSING IMPORT TO STAGING: ${config.name}`,
            error.message,
          );
        }
      }
    }
    // 5 > Không
    // 6. Ghi Log "LOAD TO STAGING DONE"
    await this.logService.logEvent(
      null,
      'SUCCESSFULLY',
      'LOAD TO STAGING DONE',
      '',
    );
  }
}
