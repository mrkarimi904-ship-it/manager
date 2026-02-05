import { HttpException, Injectable } from '@nestjs/common';
import * as dtos from './lpr_list.dtos';
import { DbService } from 'src/db/db.service';
import { generalResponse } from 'src/app.consts';

@Injectable()
export class LprListService {
  constructor(private db: DbService) {}

  async create(user: any, createLprListDto: dtos.CreateLprListDto): Promise<generalResponse> {
    try {
      const p = await this.db.lpr_list.create({ data: createLprListDto })
      const response: generalResponse = { status: true, data: p, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async findAll(user: any, query: dtos.searchLprListDto): Promise<generalResponse> {
    try {
      // create where
      if (!query.pageIndex) { query.pageIndex = "1" }
      if (!query.pageSize) { query.pageSize = "20" }
      const skip: number = (parseInt(query.pageIndex) - 1) * parseInt(query.pageSize)
      const take: number = parseInt(query.pageSize)
      const conditions: any = {} //
      if (query.isBlackList) { conditions.isBlackList = query.isBlackList === 'false' ? false : true } 
      if (query.isWhiteList) { conditions.isWhiteList = query.isWhiteList === 'false' ? false : true } 
      if (query.isPartial) { conditions.isPartial = query.isPartial === 'false' ? false : true } 
      if (query.isNotifable) { conditions.isNotifable = query.isNotifable === 'false' ? false : true } 
      if (query.search && query.search !== '') { conditions.ocr = { contains: query.search, mode: 'insensitive' } }
      if (query.brand && query.brand !== '') { conditions.vehiclebrand = { contains: query.brand, mode: 'insensitive' } }
      if (query.color && query.color !== '') { conditions.vehiclecolor = { contains: query.color, mode: 'insensitive' } }
      if (query.model && query.model !== '') { conditions.vehiclemodel = { contains: query.model, mode: 'insensitive' } }
      if (query.type && query.type !== '') { conditions.vehicletype = { contains: query.type, mode: 'insensitive' } }
      if (query.name && query.name !== '') { conditions.drivername = { contains: query.name, mode: 'insensitive' } }
      if (query.family && query.family !== '') { conditions.driverfamily = { contains: query.family, mode: 'insensitive' } }
      // fint lpr
      const [total, result] = await this.db.$transaction([
        this.db.lpr_list.count({ where: {
          ...conditions
        } }),
        this.db.lpr_list.findMany({ where: {
          ...conditions
        } , skip, take, orderBy: [{ created_at: 'desc' }] })
      ])
      const response: generalResponse = { status: true, data: { total, result }, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async findOne(user: any, id: string): Promise<generalResponse> {
    try {
      const s = await this.db.lpr_list.findFirst({ where: { id: id }, include: { lpr_list_image: true }})
      const response: generalResponse = { status: true, data: s, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async update(user: any, id: string, updateLprListDto: dtos.UpdateLprListDto): Promise<generalResponse> {
    try {
      const s = await this.db.lpr_list.update({ where: { id: id }, data: updateLprListDto, include: { lpr_list_image: true }})
      const response: generalResponse = { status: true, data: null, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async remove(user: any, id: string): Promise<generalResponse> {
    try {
      await this.db.lpr_list_image.deleteMany({ where: { lpr_list: { some: { id: id } } } })
      await this.db.operations.deleteMany({ where: { lpr_list_id: id } })
      const s = await this.db.lpr_list.delete({ where: { id: id } })
      const response: generalResponse = { status: true, data: s, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async createImage(user: any, id: string, CreateLprListImageDto: dtos.CreateLprListImageDto): Promise<generalResponse> {
    try {
      const i = await this.db.lpr_list_image.create({ data: { image: CreateLprListImageDto.image, lpr_list: { connect: { id: id } } } })
      const response: generalResponse = { status: true, data: i, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }
  
  async deleteImage(user: any, id: string, image_id: string): Promise<generalResponse> {
    try {
      const i = await this.db.lpr_list_image.delete({ where: { id: image_id, lpr_list: { some: { id:  id }} } })
      const response: generalResponse = { status: true, data: i, error: null, msg: null };
      return response;
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }
}
