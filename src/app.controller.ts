import { Controller, Get } from '@nestjs/common';
import { ExtractService } from './extract/extract.service';
import { CleanService } from './extract/clean.service';
import { TransformService } from './transform/transform.service';
import { LoadService } from './load/load.service';

@Controller()
export class AppController {
  constructor(
    private extractService: ExtractService,
    private cleanService: CleanService,
    private transformService: TransformService,
    private loadService: LoadService,
  ) {}

  // Đầu api http://localhost:3000/extract
  @Get('extract') extract() {
  //1. Khởi tạo quy trình extract()
    return this.extractService.extract();
  }

  //Đầu api http://localhost:3000/staging
  @Get('staging') upStaging() {
    return this.extractService.loadToStaging();
  }

  
 
}
