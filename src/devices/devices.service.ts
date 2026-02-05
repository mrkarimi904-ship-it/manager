import { HttpException, Injectable } from '@nestjs/common';
import { CreateDeviceDto, UpdateDeviceDto, deviceSearchQuery } from './devices.dtos';
import { DbService } from 'src/db/db.service';
import { HttpService } from '@nestjs/axios';
import { LoggerService } from 'src/logger/logger.service';
import { generalResponse } from 'src/app.consts';
import { runWithConcurrency } from 'src/app.shared';
import { XMLParser } from 'fast-xml-parser'
import { Cron } from '@nestjs/schedule';

@Injectable()
export class DevicesService {
  private readonly parser: XMLParser;

  portMappings = [
      { port: 1, value: 1 },
      { port: 2, value: 2 },
      { port: 3, value: 4 },
      { port: 4, value: 8 },
      { port: 5, value: 16 },
      { port: 6, value: 32 },
    ];

  constructor(
      private db: DbService,
      private readonly axios: HttpService,
      private loggerService: LoggerService,
    ) {
      this.parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '', trimValues: true, parseAttributeValue: false })
    }

  parse(xmlString: string): Record<string, any> {
    const parsedData = this.parser.parse(xmlString);
    const result: Record<string, any> = {};
    const textNodes = parsedData?.form?.text || [];
    if (Array.isArray(textNodes)) {
      textNodes.forEach((node) => {
        if (node.id && node.value !== undefined) {
          result[node.id] = node.value;
        }
      });
    }
    return result;
  }

  getOpenPorts(statusNumber: number): number[] {
    const openPorts: number[] = [];
    for (const { port, value } of this.portMappings) {
      if ((statusNumber & value) === value) {
        openPorts.push(port);
      }
    }
    return openPorts;
  }

  async getDeviceInfo(url: string, username: string, password: string) {
    try {
      const temp = await this.axios.axiosRef.get(`http://${url}/ad.cgx`, { auth: { username: username, password: password } })
      const output = this.parse(temp.data)
      const open_ports = this.getOpenPorts(output.relays_value)
      return { info : output, ports: open_ports }
    } catch (error) {
      throw { message: error.message }
    }
  }

  async setDevicePortOpen(url: string, username: string, password: string, port: number) {
    try {
      const mask = this.portMappings.filter(x => x.port === port).map(x => {return x.value});
      const cmd = `relays%7C${mask}`; // on
      await this.axios.axiosRef.post(`http://${url}`, 'cmd=' + cmd, { auth: { username: username, password: password }, headers: { "Content-Type": 'application/x-www-form-urlencoded' } })
      console.log('open port ', port, url)
    } catch (error) {
      throw { message: error.message }
    }
  }

  async setDevicePortClose(url: string, username: string, password: string, port: number) {
    try {
      const mask = this.portMappings.filter(x => x.port === port).map(x => {return x.value});
      const cmd = `relays%26${mask}`; // off
      await this.axios.axiosRef.post(`http://${url}`, 'cmd=' + cmd, { auth: { username: username, password: password }, headers: { "Content-Type": 'application/x-www-form-urlencoded' } })
      console.log('close port ', port, url)
    } catch (error) {
      throw { message: error.message }
    }
  }

  async setDevicePortPulse(url: string, username: string, password: string, port: number) {
    try {
      const mask = this.portMappings.filter(x => x.port === port).map(x => {return x.value});
      const cmd = `relays%7C${mask}%2C1`; // pulse
      await this.axios.axiosRef.post(`http://${url}`, 'cmd=' + cmd, { auth: { username: username, password: password }, headers: { "Content-Type": 'application/x-www-form-urlencoded' } })
      console.log('pulse port ', port, url)
    } catch (error) {
      throw { message: error.message }
    }
  }

  async create(createDeviceDto: CreateDeviceDto, user: any): Promise<generalResponse> {
    try {
      const existingByUrl = await this.db.device.findFirst({ where: { url: createDeviceDto.url } });
      if (existingByUrl) {
        if (!existingByUrl.deleted) {
          throw new HttpException({ status: false, data: null, error: 'Device with this URL already exists', msg: 'Device with this URL already exists' }, 400);
        }
        const device = await this.db.device.update({
          where: { id: existingByUrl.id },
          data: {
            deleted: false,
            name: createDeviceDto.name,
            url: createDeviceDto.url,
            username: createDeviceDto.username,
            password: createDeviceDto.password,
            port_count: createDeviceDto.port_count || 6,
            status: 'ok'
          }
        });
        await this.loggerService.log(`Device restored/created: ${device.id}`, 0, user, user.id);
        return { status: true, data: device, error: null, msg: null };
      }
      const device = await this.db.device.create({ data: { name: createDeviceDto.name, url: createDeviceDto.url, username: createDeviceDto.username, password: createDeviceDto.password, port_count: createDeviceDto.port_count || 6, status: 'ok' } });
      await this.loggerService.log(`Device created: ${device.id}`, 0, user, user.id);
      return { status: true, data: device, error: null, msg: null };
    } catch (error) {
      if (error instanceof HttpException) { throw error; }
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async findAll(user: any, query: deviceSearchQuery): Promise<generalResponse> {
    try {
      const pageSize = parseInt(query.pageSize) || 20;
      const pageIndex = parseInt(query.pageIndex) || 1;
      const search = query.search || '';
      const whereClause = { deleted: false, AND: [] };
      if (search && search !== '') {
        whereClause.AND.push({ OR: [{ url: { contains: search, mode: 'insensitive' } }, { name: { contains: search, mode: 'insensitive' } }] });
      }
      const [devices, total] = await Promise.all([
        this.db.device.findMany({ where: whereClause, skip: (pageIndex - 1) * pageSize, take: pageSize, orderBy: { created_at: 'desc' } }),
        this.db.device.count({ where: whereClause })
      ]);
      return { status: true, data: { data: devices, total }, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async getSingle(user: any, id: string): Promise<generalResponse> {
    try {
      const device = await this.db.device.findFirst({ where: { id: id, deleted: false } });
      if (!device) { throw new HttpException({ status: false, data: null, error: 'Device not found', msg: 'Device not found' }, 404); }
      return { status: true, data: device, error: null, msg: null };
    } catch (error) {
      if (error instanceof HttpException) { throw error; }
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async putSingle(id: string, updateDeviceDto: UpdateDeviceDto, user: any): Promise<generalResponse> {
    try {
      const existingDevice = await this.db.device.findFirst({ where: { id: id, deleted: false } });
      if (!existingDevice) { throw new HttpException({ status: false, data: null, error: 'Device not found', msg: 'Device not found' }, 404); }
      if (updateDeviceDto.url && updateDeviceDto.url !== existingDevice.url) {
        const urlConflict = await this.db.device.findFirst({ where: { url: updateDeviceDto.url, id: { not: id } } });
        if (urlConflict) {
          if (!urlConflict.deleted) {
            throw new HttpException({ status: false, data: null, error: 'Device with this URL already exists', msg: 'Device with this URL already exists' }, 400);
          }
          await this.db.device.update({
            where: { id: urlConflict.id },
            data: { url: `__deleted_${urlConflict.id}_${Date.now()}` }
          });
        }
      }
      const updatedDevice = await this.db.device.update({ where: { id: id }, data: { ...(updateDeviceDto.name && { name: updateDeviceDto.name }), ...(updateDeviceDto.url && { url: updateDeviceDto.url }), ...(updateDeviceDto.username && { username: updateDeviceDto.username }), ...(updateDeviceDto.password && { password: updateDeviceDto.password }), ...(updateDeviceDto.port_count && { port_count: updateDeviceDto.port_count }) } });
      await this.loggerService.log(`Device updated: ${updatedDevice.id}`, 0, user, user.id);
      return { status: true, data: updatedDevice, error: null, msg: null };
    } catch (error) {
      if (error instanceof HttpException) { throw error; }
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

    async deleteSingle(user: any, id: string): Promise<generalResponse> {
    try {
      const existingDevice = await this.db.device.findFirst({ where: { id: id, deleted: false } });
      if (!existingDevice) { throw new HttpException({ status: false, data: null, error: 'Device not found', msg: 'Device not found' }, 404); }
      await this.db.device.update({ where: { id: id }, data: { deleted: true } });
      await this.loggerService.log(`Device deleted: ${existingDevice.id}`, 0, user, user.id);
             return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      if (error instanceof HttpException) { throw error; }
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  @Cron('0 */5 * * * *')
  async handleCron() {
    if (process.env.NODE_ENV) { return true }
    try {
      console.debug('scanning devices health ...', new Date().toString());
      const devices = await this.db.device.findMany({ where: { deleted: false } });
      const concurrencyLimit = 10;
      const statuses = await runWithConcurrency(devices, concurrencyLimit, async (device: { id: string; url: string; username: string; password: string; status?: string }) => {
        try {
          await this.getDeviceInfo(device.url, device.username, device.password);
          if (device.status !== 'ok') { await this.db.device.update({ where: { id: device.id }, data: { status: 'ok' } }); console.log(`Device ${device.url} is now online`); }
          return 'online';
        } catch (error) {
          if (device.status !== 'offline') { await this.db.device.update({ where: { id: device.id }, data: { status: 'offline' } }); console.log(`Device ${device.url} is now offline: ${error.message}`); }
          return 'offline';
        }
      });
      const onlineCount = statuses.filter(s => s === 'online').length;
      const offlineCount = statuses.filter(s => s === 'offline').length;
      console.debug(`devices health check completed - Online: ${onlineCount}, Offline: ${offlineCount}`, new Date().toString());
    } catch (error) {
      console.log('error scanning devices health', error);
    }
  }
}
