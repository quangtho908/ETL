import { Injectable } from '@nestjs/common';
import { Client } from 'pg';  // Bạn có thể sử dụng thư viện pg cho PostgreSQL hoặc các thư viện khác nếu dùng cơ sở dữ liệu khác
//import { sendMail } from './loadToDataMart.controller'; // Tạo service gửi mail

@Injectable()
export class HandleConfigService {
  private client: Client;

  constructor() {
    this.client = new Client({
      host: 'localhost',
      port: 5432,
      user: 'username',
      password: 'password',
      database: 'datamart',
    });
    this.client.connect();
  }

  async getConfigs() {
    const res = await this.client.query('SELECT * FROM config WHERE flag = 1');
    return res.rows;
  }

  async countProcessing() {
    const res = await this.client.query('SELECT COUNT(*) FROM processing WHERE status = $1', ['RUNNING']);
    return res.rows[0].count;
  }

  // Các phương thức khác như updateStatusConfigsDatamartToMloading(), insertStatusLogsDatamartMloading()...
  async updateProcessingConfigsDatamartTo1() {
    await this.client.query('UPDATE config SET processing = 1 WHERE flag = 1');
  }

  async sendMail(recipient: string, message: string) {
    try {
    //  await sendMail(recipient, message);  // Sử dụng một service gửi mail
    } catch (err) {
      console.error('Mail send error:', err);
    }
  }

  // Cập nhật trạng thái cho config
  async updateStatusConfigsDatamartToMloading() {
    await this.client.query('UPDATE config SET status = $1 WHERE flag = 1', ['MLOADING']);
  }

  async updateStatusConfigsDatamartToError() {
    await this.client.query('UPDATE config SET status = $1 WHERE flag = 1', ['ERROR']);
  }

  // Các phương thức khác như updateFlagConfigs, updateProcessingConfigsDatamartTo0, etc.
}