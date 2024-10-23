import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { link, writeFileSync } from 'fs';
import { Model } from 'mongoose';
import { Config } from 'src/schema/config.schema';

@Injectable()
export class ExtractService {
  private configs: Config[];
  constructor(@InjectModel(Config.name) private configModel: Model<Config>) {}

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
    // console.log(this.configs)
    for (let config of this.configs) {
      const allProductLinks = await this.fetchLinks(config);
      const chunkSize = 10;
      const allProductsDetails = [];
      for (let i = 0; i < allProductLinks.length; i += chunkSize) {
        const chunk = allProductLinks.slice(i, i + chunkSize);
        const productsDetails = await Promise.all(
          chunk.map((link) => this.getProductDetails(link, config)),
        );
        allProductsDetails.push(...productsDetails);
      }

      // const productsDetails = await Promise.all(allProductLinks.map(link => this.getProductDetails(link, config)));

      writeFileSync(
        config.file,
        JSON.stringify(allProductsDetails, null, 2),
        'utf-8',
      );
    }

    // Chia mảng thành các nhóm và xử lý từng nhóm
    // fs.writeFileSync('product_details.json', JSON.stringify(allProductsDetails, null, 2), 'utf-8');
    // console.log('Product details saved to product_details.json');
    // Hiển thị thông tin sản phẩm
    // allProductsDetails.forEach((details, index) => {
    //     console.log(`Details for product ${index + 1}:`, details);
    // });
  }

  async getProductDetails(link, config: Config) {
    const { data } = await axios.get(link);
    const $ = cheerio.load(data);
    const details = {};
    const query = JSON.parse(config.query);
    query.forEach((q) => {
      if (q.type === 'common') {
        $(q.parent).each((_index, element) => {
          const name = $(element).find(q.name).text().trim();
          let value = $(element).find(q.value).text().trim();
          value = value.replace(/\n\s{52}/g, '_');
          details[name] = value;
        });
        return;
      }
      details[q.name] = $(q.value).text().trim();
    });

    // Lấy tên sản phẩm từ thẻ h1
    // const productName = $('h1').text().trim();
    // details["Tên sản phẩm"] = productName;

    // Lấy giá từ thẻ .box-price-present
    // const productPrice = $('.box-price-present').text().trim();
    // details["Giá"] = productPrice;

    // Duyệt qua từng phần tử <li> để lấy tên và giá trị
    // $('.text-specifi li').each((index, element) => {
    //     const name = $(element).find('aside:first-child').text().trim();
    //     let value = $(element).find('aside:last-child').text().trim();
    //     value = value.replace(/\n\s{52}/g, '_');
    //     details[name] = value;
    // });
    // console.log(details)
    return details;
  }

  async fetchLinks(config: Config) {
    const url = `${config.url}${config.path}${config.params}`;
    const headers = JSON.parse(config.headers);
    let pageIndex = 0;
    let links = [];
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
          break;
        }
        const $ = cheerio.load(html);
        $(`${config.queryUrlDetail}`).each((index, element) => {
          const href = $(element).attr('href');
          if (href) {
            links.push(`${config.url}${href}`);
          }
        });
        pageIndex++;
      } catch (error) {
        console.error('Error fetching data:', error);
        break;
      }
    }
    return links;
  }
}
