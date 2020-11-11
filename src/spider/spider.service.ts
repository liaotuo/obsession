import { Injectable } from '@nestjs/common'
import fetch from 'node-fetch'
import * as querystring from 'querystring'
import { CustomerProducts } from './types'

@Injectable()
export class SpiderService {
  private readonly BASE_URI = 'https://wechat.zhifeishengwu.com/sc/wx/HandlerSubscribe.ashx'
  private readonly COOKIE = 'ASP.NET_SessionId=uvmegcrcn0rxpi3iftwzgoao'
  private readonly ZFTSL = '7e9802cf3d5c4c52e6d324dabcd65fc8'
  // 接口参数表
  private INTERFACE_PARAMS_MAP = {
    // 某医院的疫苗产品列表接口
    CustomerProduct: {
      act: 'CustomerProduct',
      // 湖南省妇幼保健院
      id: 4219,
      lat: 22.55640983581543,
      lng: 113.97286987304688,
    },
    // 获取预定详情
    GetCustSubscribeDateAll: {
      act: 'GetCustSubscribeDateAll',
      pid: '1',
      id: 4219,
      month: 202012,
    },
    GetCustSubscribeDateDetail: {
      act: 'GetCustSubscribeDateDetail',
      pid: '1',
      id: '4219',
      scdate: '2020-11-16',
    }
  }

  private async getCustSubscribeDateDetail() {
    const params = this.INTERFACE_PARAMS_MAP.GetCustSubscribeDateDetail
    const res = await fetch(`${this.BASE_URI}?${querystring.stringify(params)}`, {
      headers: {
        cookie: this.COOKIE,
        zftsl: this.ZFTSL,
        'content-type': 'application/json',
        'referer': 'https://servicewechat.com/wx2c7f0f3c30d99445/61/page-frame.html'
      }
    }).then(r => r.json())
    const result = res.list.map(it => ({
      时间段: `${it.StartTime} - ${it.EndTime}`,
      mxid: it.mxid,
      剩余数量: it.qty,
    }))
    console.log(`--- ${params.scdate} 可约时间段 ---`)
    console.dir(result)
    return result
  }

  /**
   * 获取可以预定的日期列表
   */
  private async getCustSubscribeDateAll(): Promise<{date: string, enable: boolean}[]> {
    const params = this.INTERFACE_PARAMS_MAP.GetCustSubscribeDateAll
    const res = await fetch(`${this.BASE_URI}?${querystring.stringify(params)}`, {
      headers: {
        cookie: this.COOKIE,
        zftsl: this.ZFTSL,
        'content-type': 'application/json',
        'referer': 'https://servicewechat.com/wx2c7f0f3c30d99445/61/page-frame.html'
      }
    }).then(r => r.json())
    const result = res.list.filter(it => Boolean(it.enable))
    console.log('--- 九价可约日期 ---')
    console.dir(result)
    return result
  }

  /**
   * 获取某医院的疫苗列表
   */
  private async getCustomerProducts(): Promise<CustomerProducts> {
    const params = this.INTERFACE_PARAMS_MAP.CustomerProduct
    const res = await fetch(`${this.BASE_URI}?${querystring.stringify(params)}`, {
      headers: {
        cookie: this.COOKIE,
        zftsl: this.ZFTSL,
        'content-type': 'application/json',
        'referer': 'https://servicewechat.com/wx2c7f0f3c30d99445/61/page-frame.html'
      }
    }).then(r => r.json())
    const result = {
      startDate: new Date(res.startDate),
      endDate: new Date(res.endDate),
      cname: res.cname,
      list: res.list.map(it => ({
        id: it.id,
        text: it.text,
        enable: it.enable,
        btnLabelL: it.BtnLable,
      }))
    }
    console.log('--- 疫苗列表 ---')
    console.dir(result)
    return result
  }

  /**
   * 启动爬虫
   */
  async start(): Promise<void> {
    // 获取产品列表
    const product = await this.getCustomerProducts()
    // 获取九价
    const hpv9 = product.list.filter(it => it.text.includes('九价'))[0]
    // this.INTERFACE_PARAMS_MAP.GetCustSubscribeDateAll.pid = hpv9.id
    this.INTERFACE_PARAMS_MAP.GetCustSubscribeDateAll.pid = '3'
    const dateList = await this.getCustSubscribeDateAll()
    for (const date of dateList) {
      this.INTERFACE_PARAMS_MAP.GetCustSubscribeDateDetail.pid = '3'
      this.INTERFACE_PARAMS_MAP.GetCustSubscribeDateDetail.scdate = date.date
      const res = await this.getCustSubscribeDateDetail()
      // TODO 调用预定接口
    }
    console.log('开始发起预定...')
  }
}
