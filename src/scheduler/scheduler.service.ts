import { HttpException, Injectable } from '@nestjs/common';
import { DbService } from 'src/db/db.service';
import * as dtos from './scheduler.dtos';
import * as cronParser from 'cron-parser'
import { generalResponse } from 'src/app.consts';

@Injectable()
export class SchedulerService {

  constructor(private db: DbService) {}

  async post_user_account(user: any, user_id: string, scheduleBody: dtos.scheduleDto): Promise<generalResponse> {
    try {
      cronParser.parseExpression(scheduleBody.from);
      cronParser.parseExpression(scheduleBody.to);
      const temp = await this.db.scheduler_user_account.create({ data: { title: scheduleBody.title, from: scheduleBody.from, to: scheduleBody.to, user_accounts: { connect: { id: user_id } } } })
      return { status: true, data: temp, error: null, msg: null }
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async get_user_accounts(user: any, user_id: string, query: dtos.scheduleSearchDto): Promise<generalResponse> {
    try {
      // create where
      if (!query.pageIndex) { query.pageIndex = "1" }
      if (!query.pageSize) { query.pageSize = "20" }
      const skip: number = (parseInt(query.pageIndex) - 1) * parseInt(query.pageSize)
      const take: number = parseInt(query.pageSize)
      const where = { AND: [] }
      if (query.search) { where['AND'].push({ title: { contains: query.search, mode: 'insensitive' } }) }
      if (user_id) { where['AND'].push({ user_accounts: { some: { id: { equals: user_id } } } }) }
      // include
      const include = { user_accounts: true }
      // run query
      const [total, temp] = await this.db.$transaction([
        this.db.scheduler_user_account.count({ where }),
        this.db.scheduler_user_account.findMany({ where, skip, take, include, orderBy: [{ created_at: 'desc' }] })
      ])
      const response: generalResponse = { status: true, data: { total, data: temp }, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async get_user_account(user: any, user_id: string, id: string): Promise<generalResponse> {
    try {
      const temp = await this.db.scheduler_user_account.findUnique({ where: { id: id, user_accounts: { some: { id: user_id} } } });
      return { status: true, data: temp, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async put_user_account(user: any, user_id: string, id: string, scheduleBody: dtos.scheduleEditDto): Promise<generalResponse> {
    try {
      cronParser.parseExpression(scheduleBody.from);
      cronParser.parseExpression(scheduleBody.to);
      const temp = await this.db.scheduler_user_account.update({ where: { id: id, user_accounts: { some: { id: user_id } } }, data: { title: scheduleBody.title, from: scheduleBody.from, to: scheduleBody.to} })
      return { status: true, data: temp, error: null, msg: null }
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async delete_user_account(user: any, user_id: string, id: string): Promise<generalResponse> {
    try {
      await this.db.scheduler_user_account.delete({ where: { id: id, user_accounts: { some: { id: user_id } } } });
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }






  async post_user_group(user: any, group_id: string, scheduleBody: dtos.scheduleDto): Promise<generalResponse> {
    try {
      cronParser.parseExpression(scheduleBody.from);
      cronParser.parseExpression(scheduleBody.to);
      const temp = await this.db.scheduler_user_group.create({ data: { title: scheduleBody.title, from: scheduleBody.from, to: scheduleBody.to, user_groups: { connect: { id: group_id } } } })
      return { status: true, data: temp, error: null, msg: null }
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async get_user_groups(user: any, group_id: string, query: dtos.scheduleSearchDto): Promise<generalResponse> {
    try {
      // create where
      if (!query.pageIndex) { query.pageIndex = "1" }
      if (!query.pageSize) { query.pageSize = "20" }
      const skip: number = (parseInt(query.pageIndex) - 1) * parseInt(query.pageSize)
      const take: number = parseInt(query.pageSize)
      const where = { AND: [] }
      if (query.search) { where['AND'].push({ title: { contains: query.search, mode: 'insensitive' } }) }
      if (group_id) { where['AND'].push({ user_groups: { some: { id: { equals: group_id } } } }) }
      // include
      const include = { user_groups: true }
      // run query
      const [total, temp] = await this.db.$transaction([
        this.db.scheduler_user_group.count({ where }),
        this.db.scheduler_user_group.findMany({ where, skip, take, include, orderBy: [{ created_at: 'desc' }] })
      ])
      const response: generalResponse = { status: true, data: { total, data: temp }, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async get_user_group(user: any, group_id: string, id: string): Promise<generalResponse> {
    try {
      const temp = await this.db.scheduler_user_group.findUnique({ where: { id: id, user_groups: { some: { id: group_id } } } });
      return { status: true, data: temp, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async put_user_group(user: any, group_id: string, id: string, scheduleBody: dtos.scheduleEditDto): Promise<generalResponse> {
    try {
      cronParser.parseExpression(scheduleBody.from);
      cronParser.parseExpression(scheduleBody.to);
      const temp = await this.db.scheduler_user_group.update({ where: { id: id, user_groups: { some: { id: group_id } } }, data: { title: scheduleBody.title, from: scheduleBody.from, to: scheduleBody.to} })
      return { status: true, data: temp, error: null, msg: null }
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async delete_user_group(user: any, group_id: string, id: string): Promise<generalResponse> {
    try {
      await this.db.scheduler_user_group.delete({ where: { id: id, user_groups: { some: { id: group_id } } } });
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }










  async post_ip_mac(user: any, user_id: string, scheduleBody: dtos.scheduleIpMacDto): Promise<generalResponse> {
    try {
      if (scheduleBody.typee !== 'ip') { scheduleBody.typee = 'mac' }
      if (scheduleBody.typee === 'ip') { if (!this.isValidIPWithSubnet(scheduleBody.value)) { throw new Error('Invalid IP Address') } }
      if (scheduleBody.typee === 'mac') { if (!this.isValidMACAddress(scheduleBody.value)) { throw new Error('Invalid Mac Address') } }
      const temp = await this.db.scheduler_ip_mac.create({ data: { title: scheduleBody.title, typee: scheduleBody.typee, value: scheduleBody.value, user_accounts: { connect: { id: user_id } } } })
      return { status: true, data: temp, error: null, msg: null }
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async get_ip_macs(user: any, user_id: string, query: dtos.scheduleSearchDto): Promise<generalResponse> {
    try {
      // create where
      if (!query.pageIndex) { query.pageIndex = "1" }
      if (!query.pageSize) { query.pageSize = "20" }
      const skip: number = (parseInt(query.pageIndex) - 1) * parseInt(query.pageSize)
      const take: number = parseInt(query.pageSize)
      const where = { AND: [] }
      if (query.search) { where['AND'].push({ title: { contains: query.search, mode: 'insensitive' } }) }
      if (user_id) { where['AND'].push({ user_accounts: { some: { id: { equals: user_id } } } }) }
      // include
      const include = { user_accounts: true }
      // run query
      const [total, temp] = await this.db.$transaction([
        this.db.scheduler_ip_mac.count({ where }),
        this.db.scheduler_ip_mac.findMany({ where, skip, take, include, orderBy: [{ created_at: 'desc' }] })
      ])
      const response: generalResponse = { status: true, data: { total, data: temp }, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async get_ip_mac(user: any, user_id: string, id: string): Promise<generalResponse> {
    try {
      const temp = await this.db.scheduler_ip_mac.findUnique({ where: { id: id, user_accounts: { some: { id: user_id} } } });
      return { status: true, data: temp, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async put_ip_mac(user: any, user_id: string, id: string, scheduleBody: dtos.scheduleIpMacDto): Promise<generalResponse> {
    try {
      if (scheduleBody.typee !== 'ip') { scheduleBody.typee = 'mac' }
      if (scheduleBody.typee === 'ip') { if (!this.isValidIPWithSubnet(scheduleBody.value)) { throw new Error('Invalid IP Address') } }
      if (scheduleBody.typee === 'mac') { if (!this.isValidMACAddress(scheduleBody.value)) { throw new Error('Invalid Mac Address') } }
      const temp = await this.db.scheduler_ip_mac.update({ where: { id: id, user_accounts: { some: { id: user_id } } }, data: { title: scheduleBody.title, typee: scheduleBody.typee, value: scheduleBody.value} })
      return { status: true, data: temp, error: null, msg: null }
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async delete_ip_mac(user: any, user_id: string, id: string): Promise<generalResponse> {
    try {
      await this.db.scheduler_ip_mac.delete({ where: { id: id, user_accounts: { some: { id: user_id } } } });
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }




  // const options = {
    //   currentDate: new Date(),
    //   // endDate: new Date('Wed, 26 Dec 2025 14:40:00 UTC'),
    //   // iterator: true
    // };
    // const interval = cronParser.parseExpression('*/10 * * * * *', options);
    // console.log('Date: ', interval.next().toString());
    // console.log('Date: ', interval.next().toString());
    // console.log('Date: ', interval.next().toString());
    // console.log('Date: ', interval.next().toString());



  async verify_user_account(user_id: string): Promise<generalResponse> {
    try {
      let overAll = false
      const list = await this.db.scheduler_user_account.findMany({ where: { user_accounts: { some: { id: { equals: user_id } } } } })
      const list2 = await this.db.scheduler_user_group.findMany({ where: { user_groups: { some: { user_accounts: { some: { id: { equals: user_id } } } } }}})
      list.forEach(element => {
        const cronStart = element.from
        const cronStop = element.to
        const now = new Date()
        const startInterval = cronParser.parseExpression(cronStart)
        const stopInterval = cronParser.parseExpression(cronStop)
        const prevStart = new Date(startInterval.prev().toDate())
        const prevStop = new Date(stopInterval.prev().toDate())
        if (now.getTime() - prevStart.getTime() < now.getTime() - prevStop.getTime()) { overAll = true }
        console.log({ rule: element.id, user: user_id, c: prevStart, d: prevStop, overAll: overAll, now: now })
      })
      list2.forEach(element => {
        const cronStart = element.from
        const cronStop = element.to
        const now = new Date()
        const startInterval = cronParser.parseExpression(cronStart)
        const stopInterval = cronParser.parseExpression(cronStop)
        const prevStart = new Date(startInterval.prev().toDate())
        const prevStop = new Date(stopInterval.prev().toDate())
        if (now.getTime() - prevStart.getTime() < now.getTime() - prevStop.getTime()) { overAll = true }
      })
      if (list.length === 0 && list2.length === 0) { overAll = true }
      return { status: true, data: { valid: overAll }, error: null, msg: null };
    } catch (error) {
      return { status: false, data: null, error: error, msg: error.message };
    }
  }







  async verify_ip_mac(user_id: string, ip: string, mac: string): Promise<generalResponse> {
    try {
      let overAll = true
      const ips = await this.db.scheduler_ip_mac.findMany({ where: { typee: 'ip', user_accounts: { some: { id: { equals: user_id } } } } })
      const macs = await this.db.scheduler_ip_mac.findMany({ where: { typee: 'mac', user_accounts: { some: { id: { equals: user_id } } } } })
      if (ips.length === 0 && macs.length === 0) { overAll = true }
      ips.forEach(element => {
        if (!this.inSubNet(ip, element.value)) { overAll = false }
      })
      macs.forEach(element => {
        if (mac !== element.value) { overAll = false }
      })
      return { status: true, data: { valid: overAll }, error: null, msg: null };
    } catch (error) {
      return { status: false, data: null, error: error, msg: error.message };
    }
  }








  isValidIPWithSubnet(ipWithSubnet) {
    const regex = /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/;
    if (!regex.test(ipWithSubnet)) { return false; }
    const [ip, subnet] = ipWithSubnet.split('/');
    const ipParts = ip.split('.');
    if (ipParts.length !== 4) { return false; }
    for (let part of ipParts) {
        const num = parseInt(part, 10);
        if (isNaN(num) || num < 0 || num > 255) { return false; }
    }
    const subnetNum = parseInt(subnet, 10);
    if (isNaN(subnetNum) || subnetNum < 0 || subnetNum > 32) { return false; }
    return true;
  }

  isValidMACAddress(mac) {
    const regex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    return regex.test(mac);
  }

  ip2long(ip){
    let components;
    if(components = ip.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/))
    {
        let iplong = 0;
        let power  = 1;
        for(let i=4; i>=1; i-=1)
        {
            iplong += power * parseInt(components[i]);
            power  *= 256;
        }
        return iplong;
    }
    else return -1;
  }

  inSubNet(ip, subnet)
  {
    let mask, base_ip
    const long_ip = this.ip2long(ip);
    if( (mask = subnet.match(/^(.*?)\/(\d{1,2})$/)) && ((base_ip=this.ip2long(mask[1])) >= 0) )
    {
      const freedom = Math.pow(2, 32 - parseInt(mask[2]));
      return (long_ip >= base_ip) && (long_ip <= base_ip + freedom - 1);
    }
    else return false;
  }

}
