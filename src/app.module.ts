import { Module } from '@nestjs/common'
import { AppService } from './app.service'
import { SpiderModule } from './spider/spider.module'

@Module({
  imports: [SpiderModule],
  providers: [AppService],
})
export class AppModule {
}
