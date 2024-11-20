export const hash_secret = 10;
export const jwt_secret = '8A29D7EFFF21574F47E6A936CB7B6';


export class generalResponse {
  status: boolean
  data: null | string | object | object[]
  error: null | string | object | object[]
  msg: null | string
}