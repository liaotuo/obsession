import { Injectable } from '@nestjs/common'
import { SpiderService } from './spider/spider.service'

@Injectable()
export class AppService {
  constructor(
    private readonly spiderService: SpiderService
  ) {
  }

  start(): void {
    console.log('\n\n执念小爬虫已启动...\n\n')
    this.spiderService.start()
  }
}
