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

  @Get('extract') extract() {
    return this.extractService.extract();
  }

  @Get('staging') upStaging() {
    return this.extractService.loadToStaging();
  }

  @Get('clean') clean() {
    return this.cleanService.clean();
  }

  @Get('transform')
  transform() {
    return this.transformService.start();
  }

  @Get('load')
  load() {
    return this.loadService.load();
  }
}
