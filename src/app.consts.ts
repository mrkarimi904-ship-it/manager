export const hash_secret = 10;

export class generalResponse {
  status: boolean
  data: null | string | object | object[]
  error: null | string | object | object[]
  msg: null | string
}