import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ExtractService } from './extract/extract.service';

@Controller()
export class AppController {
  constructor(private extractService: ExtractService) {}

  @Get()
  getHello() {
    return this.extractService.extract()
  }

  @Get("staging")
  upStaging() {
    return this.extractService.loadToStaging("dienmayxanh")    
  }
}
