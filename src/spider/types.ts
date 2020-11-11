export interface Product {
  readonly id: string
  readonly text: string
  readonly enable: boolean
  readonly btnLabel: string
}

// 医院产品列表
export interface CustomerProducts {
  readonly startDate: Date
  readonly endDate: Date
  readonly cname: string
  readonly list: Product[]
}
