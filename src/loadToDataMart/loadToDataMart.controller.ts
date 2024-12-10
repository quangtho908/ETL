import { Controller, Get } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';

@Controller('load-to-datamart')
@Injectable()
// 1 . request đến endpoint /load-to-datamart/start, khởi tạo quá trình loadDataToDataMart()
export class LoadToDataMartController {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'your-email@gmail.com',
      pass: 'your-email-password',
    },
  });

  constructor() {}

  @Get('start')
  async loadDataToDataMart() {
    try {
      // 2 .Lấy danh sách config từ cơ sở dữ liệu
      const configs = await this.getConfigs();

      for (const config of configs) {
        let maxWait = 0;

       // 3. Kiểm tra phương thức countProcessing()
        // 3.1. Nếu có  processing, vòng lặp sẽ đợi
        // và kiểm tra lại số lượng tối đa 3 lần chờ.
        while (await this.countProcessing() !== 0 && maxWait <= 3) {
          console.log('Waiting...');
          maxWait++;
          await new Promise(resolve => setTimeout(resolve, 2000));  // Giống như Thread.sleep() trong Java
        }

        //4 . Kiểm tra xem có processing nào không, nếu không thì tiếp tục
        if (await this.countProcessing() === 0) {
          // 5 . Lấy status của config
          const status = config.status;

          // 6. Nếu trạng thái là 'WH_LOADED', tiến hành load data vào DataMart
          if (status === 'WH_LOADED') {
            console.log('START: LOAD TO DATAMART');
            //7.7.Thực hiện load Data vào Data Mart
            await this.loadToDataMartLogic();
            // 6.1Ghi log báo lỗi
            console.log('END: LOAD TO DATAMART');
          }
        }
      }

      console.log('Process completed');
      // 16 .Cập nhật status của config thành ERROR
    } catch (error) {
      // 17 . Thêm lỗi vào log
      console.error('Error:', error);
    }
  }

  // Lấy danh sách config từ cơ sở dữ liệu
  async getConfigs() {
    // Thực thi truy vấn để lấy danh sách config từ cơ sở dữ liệu hoặc nguồn dữ liệu
    return [
      // 8 .Cập nhật status của config thành MLOADING
      { id: 1, status: 'WH_LOADED' }, // Ví dụ một cấu hình có trạng thái là 'WH_LOADED'
      console.log('MLOADING  ');
    ];
  }

  // Đếm số lượng processing hiện tại
  async countProcessing() {
    // Kiểm tra số lượng processing từ cơ sở dữ liệu hoặc nguồn dữ liệu
    return 0;
  }

  // Load Data vào Data Mart
  async loadToDataMartLogic() {
    const timeNow = new Date().toLocaleString();

    try {
      // Cập nhật trạng thái đang xử lý
      await this.updateProcessingConfigsDatamartTo1();

      // Cập nhật trạng thái thành MLOADING
      await this.updateStatusConfigsDatamartToMloading();

      //10. Thông báo qua email quá trinh load dữ liệu vào DataMart
      await this.sendMail('recipient@example.com', `Start loading data to DataMart at ${timeNow}`);


      // await this.loadDataToMart(); // Logic load dữ liệu vào DataMart
// 11 . Thực hiện các bước dữ liệu load vào Data Mart
      // Sau khi load xong, cập nhật trạng thái thành MLOADED
      // 12 .  Cập nhật phương thức updateStatusConfigsDatamartToMloaded()
      // thành MLOADED
      await this.updateStatusConfigsDatamartToMloaded();
      // 13. Thông báo phương thức updateStatusConfigsDatamartToMloaded()
      // thành MLOADED đã vào log
      console.log('Data loaded successfully');
    } catch (error) {
      console.error('Error in data load:', error);
      // Nếu có lỗi, cập nhật trạng thái thành ERROR
      await this.updateStatusConfigsDatamartToError();
      // 15 . Gửi thông tin đến user
      await this.sendMail('recipient@example.com', `Error during DataMart Load: ${error.message}`);
    }
  }

  // Các phương thức xử lý trạng thái
  async updateProcessingConfigsDatamartTo1() {
    // Cập nhật trạng thái là đang xử lý (giả sử đây là một truy vấn cơ sở dữ liệu)
    console.log('Updating status to processing...');
    // await this.dbService.updateConfigStatus('processing', 1); // Ví dụ
  }

  async updateStatusConfigsDatamartToMloading() {
    // Cập nhật trạng thái thành MLOADING
    console.log('Updating status to MLOADING...');
    // await this.dbService.updateConfigStatus('status', 'MLOADING'); // Ví dụ
  }

  async updateStatusConfigsDatamartToMloaded() {
    // Cập nhật trạng thái thành MLOADED
    console.log('Updating status to MLOADED...');
    // await this.dbService.updateConfigStatus('status', 'MLOADED'); // Ví dụ
  }
 // 18 . Cập nhật trạng thái của config là không thể xử lý
  async updateStatusConfigsDatamartToError() {
    console.log('Updating status to ERROR...');
    // await this.dbService.updateConfigStatus('status', 'ERROR'); // Ví dụ
  }

  // Phương thức gửi email
  async sendMail(recipient: string, message: string) {
    await this.transporter.sendMail({
      from: '"Data Mart" <your-email@gmail.com>',
      to: recipient,
      subject: 'Data Mart Load Status',
      text: message,
    });
  }
}