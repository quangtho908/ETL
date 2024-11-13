import { Controller, Get } from '@nestjs/common';
import { ExtractService } from './extract/extract.service.bak';
import { CleanService } from './extract/clean.service';

@Controller()
export class AppController {
  constructor(
    private extractService: ExtractService,
    private cleanService: CleanService,
  ) {}

  @Get() getHello() {
    return this.extractService.extract();
  }

  @Get('staging') upStaging() {
    return this.extractService.loadToStaging('dienmayxanh');
  }

  @Get('clean') clean() {
    return this.cleanService.clean('671707e06d945da2d303891f');
  }
}
