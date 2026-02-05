import { ConflictException, HttpException, Injectable } from '@nestjs/common';
import * as dtos from './mismatch.dto';
import { generalResponse } from 'src/app.consts';
import { DbService } from 'src/db/db.service';
import { HttpService } from '@nestjs/axios';
import { StreamService } from 'src/stream/stream.service';

@Injectable()
export class MismatchService {
  constructor(private db: DbService, private readonly axios: HttpService, private stream: StreamService) {}

  async findAll(user: any): Promise<generalResponse> {
    try {
      // Build where clause for user access
      const where: any = { AND: [] }

      if (user && user.isSuperAdmin !== true) {
        where['AND'].push({
          OR: [
            {
              camera1: {
                OR: [
                  { user_accounts: { some: { id: { equals: user.id } } } },
                  { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
                  { camera_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
                  { camera_groups: { some: { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } } } }
                ],
                deleted: false
              }
            },
            {
              camera2: {
                OR: [
                  { user_accounts: { some: { id: { equals: user.id } } } },
                  { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
                  { camera_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
                  { camera_groups: { some: { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } } } }
                ],
                deleted: false
              }
            }
          ]
        })
      }

      const list = await this.db.mismatch.findMany({
        where,
        include: {
          camera1: { select: { id: true, url: true } },
          camera2: { select: { id: true, url: true } },
          mismatch_service: true
        },
        orderBy: { id: 'desc' }
      })
      return { status: true, data: list, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async findOne(user: any, mismatch_id: string): Promise<generalResponse> {
    try {
      // Build where clause for user access
      const where: any = {
        id: mismatch_id,
        AND: []
      }

      if (user && user.isSuperAdmin !== true) {
        where['AND'].push({
          OR: [
            {
              camera1: {
                OR: [
                  { user_accounts: { some: { id: { equals: user.id } } } },
                  { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
                  { camera_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
                  { camera_groups: { some: { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } } } }
                ],
                deleted: false
              }
            },
            {
              camera2: {
                OR: [
                  { user_accounts: { some: { id: { equals: user.id } } } },
                  { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
                  { camera_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
                  { camera_groups: { some: { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } } } }
                ],
                deleted: false
              }
            }
          ]
        })
      }

      const mismatch = await this.db.mismatch.findFirst({
        where,
        include: {
          camera1: { select: { id: true, url: true } },
          camera2: { select: { id: true, url: true } },
          mismatch_service: true
        }
      })
      if (!mismatch) { throw new ConflictException() }

      return { status: true, data: mismatch, error: null, msg: null }
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async create(user: any, body: dtos.CreateMismatchDto): Promise<generalResponse> {
    try {
      // Check if cameras are available and user has access
      const where1 = { id: body.camera1_id, deleted: false, AND: [] }
      const where2 = { id: body.camera2_id, deleted: false, AND: [] }

      if (user && user.isSuperAdmin !== true) {
        where1['AND'].push({ OR: [
          { user_accounts: { some: { id: { equals: user.id } } } },
          { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
          { camera_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
          { camera_groups: { some: { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } } } }
        ] })
        where2['AND'].push({ OR: [
          { user_accounts: { some: { id: { equals: user.id } } } },
          { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
          { camera_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
          { camera_groups: { some: { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } } } }
        ] })
      }

      const [camera1, camera2] = await Promise.all([
        this.db.camera.findUnique({ where: where1 }),
        this.db.camera.findUnique({ where: where2 })
      ]);
      if (!camera1 || !camera2) { throw new ConflictException() }

      const mismatchService = await this.db.mismatch_service.findFirst({ where: { id: body.mismatch_service_id } })
      if (!mismatchService) { throw new ConflictException() }

      // Check if mismatch already exists between these cameras
      const existing = await this.db.mismatch.findFirst({
        where: {
          OR: [
            { camera1_id: body.camera1_id, camera2_id: body.camera2_id },
            { camera1_id: body.camera2_id, camera2_id: body.camera1_id }
          ]
        }
      })
      if (existing) { throw new ConflictException('Mismatch already exists between these cameras') }

      const res = await this.db.mismatch.create({
        data: {
          title: body.title,
          camera1_id: body.camera1_id,
          camera2_id: body.camera2_id,
          delay: body.delay,
          mismatch_service: { connect: { id: mismatchService.id } }
        },
        include: {
          camera1: { select: { id: true, url: true } },
          camera2: { select: { id: true, url: true } },
          mismatch_service: true
        }
      })

      return { status: true, data: res, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async update(user: any, mismatch_id: string, body: dtos.UpdateMismatchDto): Promise<generalResponse> {
    try {
      // Check if mismatch exists and user has access
      const where: any = {
        id: mismatch_id,
        AND: []
      }

      if (user && user.isSuperAdmin !== true) {
        where['AND'].push({
          OR: [
            {
              camera1: {
                OR: [
                  { user_accounts: { some: { id: { equals: user.id } } } },
                  { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
                  { camera_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
                  { camera_groups: { some: { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } } } }
                ],
                deleted: false
              }
            },
            {
              camera2: {
                OR: [
                  { user_accounts: { some: { id: { equals: user.id } } } },
                  { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
                  { camera_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
                  { camera_groups: { some: { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } } } }
                ],
                deleted: false
              }
            }
          ]
        })
      }

      const mismatch = await this.db.mismatch.findFirst({ where })
      if (!mismatch) { throw new ConflictException() }

      // Check if mismatch is not running
      if (mismatch.isActive && mismatch.status === 'RUNNING') { throw new ConflictException('Cannot update running mismatch') }

      const res = await this.db.mismatch.update({
        where: { id: mismatch_id },
        data: body,
        include: {
          camera1: { select: { id: true, url: true } },
          camera2: { select: { id: true, url: true } },
          mismatch_service: true
        }
      })

      return { status: true, data: res, error: null, msg: null }
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async start(user: any, mismatch_id: string): Promise<generalResponse> {
    try {
      // Check if mismatch exists and user has access
      const where: any = {
        id: mismatch_id,
        AND: []
      }

      if (user && user.isSuperAdmin !== true) {
        where['AND'].push({
          OR: [
            {
              camera1: {
                OR: [
                  { user_accounts: { some: { id: { equals: user.id } } } },
                  { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
                  { camera_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
                  { camera_groups: { some: { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } } } }
                ],
                deleted: false
              }
            },
            {
              camera2: {
                OR: [
                  { user_accounts: { some: { id: { equals: user.id } } } },
                  { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
                  { camera_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
                  { camera_groups: { some: { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } } } }
                ],
                deleted: false
              }
            }
          ]
        })
      }

      const mismatch = await this.db.mismatch.findFirst({
        where,
        include: { mismatch_service: true }
      })
      if (!mismatch) { throw new ConflictException() }

      // Start mismatch on service
      const mismatchService = mismatch.mismatch_service[0]
      const serviceUrl = `http://${mismatchService.url}:${mismatchService.port}/lpr-mismatch/start`

      try {
        const response = await this.axios.axiosRef.post(serviceUrl, {
          camera1: mismatch.camera1_id,
          camera2: mismatch.camera2_id,
          delay: mismatch.delay
        })

        // Update mismatch status
        await this.db.mismatch.update({
          where: { id: mismatch_id },
          data: {
            isActive: true,
            status: 'RUNNING',
            session: response.data.id
          }
        })

        return { status: true, data: { message: 'Mismatch started successfully' }, error: null, msg: null }
      } catch (error) {
        throw new ConflictException('Failed to start mismatch on service')
      }
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async stop(user: any, mismatch_id: string): Promise<generalResponse> {
    try {
      // Check if mismatch exists and user has access
      const where: any = {
        id: mismatch_id,
        AND: []
      }

      if (user && user.isSuperAdmin !== true) {
        where['AND'].push({
          OR: [
            {
              camera1: {
                OR: [
                  { user_accounts: { some: { id: { equals: user.id } } } },
                  { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
                  { camera_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
                  { camera_groups: { some: { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } } } }
                ],
                deleted: false
              }
            },
            {
              camera2: {
                OR: [
                  { user_accounts: { some: { id: { equals: user.id } } } },
                  { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
                  { camera_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
                  { camera_groups: { some: { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } } } }
                ],
                deleted: false
              }
            }
          ]
        })
      }

      const mismatch = await this.db.mismatch.findFirst({
        where,
        include: { mismatch_service: true }
      })
      if (!mismatch) { throw new ConflictException() }

      // Stop mismatch on service
      const mismatchService = mismatch.mismatch_service[0]
      const serviceUrl = `http://${mismatchService.url}:${mismatchService.port}/lpr-mismatch/stop`

      try {
        await this.axios.axiosRef.post(serviceUrl, {
          id: mismatch.session
        })

        // Update mismatch status
        await this.db.mismatch.update({
          where: { id: mismatch_id },
          data: {
            isActive: false,
            status: 'STOPPED',
            session: 'none'
          }
        })

        return { status: true, data: { message: 'Mismatch stopped successfully' }, error: null, msg: null }
      } catch (error) {
        throw new ConflictException('Failed to stop mismatch on service')
      }
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async delete(user: any, mismatch_id: string): Promise<generalResponse> {
    try {
      // Check if mismatch exists and user has access
      const where: any = {
        id: mismatch_id,
        AND: []
      }

      if (user && user.isSuperAdmin !== true) {
        where['AND'].push({
          OR: [
            {
              camera1: {
                OR: [
                  { user_accounts: { some: { id: { equals: user.id } } } },
                  { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
                  { camera_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
                  { camera_groups: { some: { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } } } }
                ],
                deleted: false
              }
            },
            {
              camera2: {
                OR: [
                  { user_accounts: { some: { id: { equals: user.id } } } },
                  { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
                  { camera_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } },
                  { camera_groups: { some: { user_groups: { some: { user_accounts: { some: { id: { equals: user.id } } } } } } } }
                ],
                deleted: false
              }
            }
          ]
        })
      }

      const mismatch = await this.db.mismatch.findFirst({ where })
      if (!mismatch) { throw new ConflictException() }

      // Stop mismatch if running
      if (mismatch.isActive) {
        await this.stop(user, mismatch_id)
      }

      // Delete mismatch
      await this.db.mismatch.delete({ where: { id: mismatch_id } })

      return { status: true, data: { message: 'Mismatch deleted successfully' }, error: null, msg: null }
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }
}