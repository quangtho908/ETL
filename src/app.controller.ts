import { Controller, Get } from '@nestjs/common';
import { TransformService } from './transform/transform.service';
import { LoadService } from './load/load.service';

@Controller()
export class AppController {
  constructor(
    private transformService: TransformService,
    private loadService: LoadService,
  ) {}

  // 1. Đầu api http://localhost:3000/transform
  @Get('transform')
  transform() {
    // 2. gọi hàm start để bắt đầu transform
    return this.transformService.start();
    // 9.2.1 Trả về response success status code 200
  }

  // 1. webhook: http://localhost:3000/load hàm load()
  @Get('load')
  load() {
    // 2. khởi tạo quá trình transform call load() của class LoadService
    return this.loadService.load();
    // 6.1 Trả về response success status code 200
  }
}
