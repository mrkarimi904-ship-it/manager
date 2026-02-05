import { HttpException, Injectable } from '@nestjs/common';
import { CreateOperationDto, UpdateOperationDto, operationSearchQuery } from './operations.dtos';
import { DbService } from 'src/db/db.service';
import { LoggerService } from 'src/logger/logger.service';
import { generalResponse } from 'src/app.consts';
import { DevicesService } from 'src/devices/devices.service';

@Injectable()
export class OperationsService {
  constructor(
    private db: DbService,
    private loggerService: LoggerService,
    private devicesService: DevicesService,
  ) {}

  async create(createOperationDto: CreateOperationDto, user: any): Promise<generalResponse> {
    try {
      const [existingLprList, existingDevice] = await Promise.all([
        this.db.lpr_list.findFirst({ where: { id: createOperationDto.lpr_list_id } }),
        this.db.device.findFirst({ where: { id: createOperationDto.device_id, deleted: false } })
      ]);
      if (!existingLprList) { throw new HttpException({ status: false, data: null, error: 'LPR List not found', msg: 'LPR List not found' }, 404); }
      if (!existingDevice) { throw new HttpException({ status: false, data: null, error: 'Device not found', msg: 'Device not found' }, 404); }

      // Validate step 2 fields if provided
      if (createOperationDto.step2_action && !createOperationDto.step2_delay_ms) {
        throw new HttpException({ status: false, data: null, error: 'Step 2 delay is required when step 2 action is provided', msg: 'Step 2 delay is required when step 2 action is provided' }, 400);
      }
      if (!createOperationDto.step2_action && createOperationDto.step2_delay_ms) {
        throw new HttpException({ status: false, data: null, error: 'Step 2 action is required when step 2 delay is provided', msg: 'Step 2 action is required when step 2 delay is provided' }, 400);
      }

      const operation = await this.db.operations.create({
        data: {
          lpr_list_id: createOperationDto.lpr_list_id,
          device_id: createOperationDto.device_id,
          name: createOperationDto.name,
          enabled_from: createOperationDto.enabled_from,
          enabled_to: createOperationDto.enabled_to,
          active: createOperationDto.active ?? true,
          port: createOperationDto.port,
          step1_action: createOperationDto.step1_action,
          step1_delay_ms: createOperationDto.step1_delay_ms,
          step2_action: createOperationDto.step2_action,
          step2_delay_ms: createOperationDto.step2_delay_ms,
          cameras: createOperationDto.cameras ? JSON.stringify(createOperationDto.cameras) : null,
          status: 'idle'
        }
      });

      await this.loggerService.log(`Operation created: ${createOperationDto.name}`, 0, user, user.id);
      return { status: true, data: operation, error: null, msg: null };
    } catch (error) {
      if (error instanceof HttpException) { throw error; }
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async findAll(user: any, query: operationSearchQuery): Promise<generalResponse> {
    try {
      const pageSize = parseInt(query.pageSize) || 20;
      const pageIndex = parseInt(query.pageIndex) || 1;
      const search = query.search || '';
      const whereClause = { deleted: false, AND: [] };
      if (search && search !== '') { whereClause.AND.push({ name: { contains: search, mode: 'insensitive' } }) }
      const [operations, total] = await Promise.all([
        this.db.operations.findMany({
          where: whereClause,
          skip: (pageIndex - 1) * pageSize,
          take: pageSize,
          orderBy: { created_at: 'desc' },
          include: { lpr_list: true, device: true }
        }),
        this.db.operations.count({ where: whereClause })
      ]);
      return { status: true, data: { data: operations, total }, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async findByLprList(lprListId: string, user: any): Promise<generalResponse> {
    try {
      const operations = await this.db.operations.findMany({
        where: { lpr_list_id: lprListId, deleted: false },
        include: { lpr_list: true, device: true },
        orderBy: { created_at: 'desc' }
      });
      return { status: true, data: operations, error: null, msg: null };
    } catch (error) {
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async getSingle(user: any, id: string): Promise<generalResponse> {
    try {
      const operation = await this.db.operations.findFirst({
        where: { id: id, deleted: false },
        include: { lpr_list: true, device: true }
      });
      if (!operation) { throw new HttpException({ status: false, data: null, error: 'Operation not found', msg: 'Operation not found' }, 404); }
      return { status: true, data: operation, error: null, msg: null };
    } catch (error) {
      if (error instanceof HttpException) { throw error; }
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async putSingle(id: string, updateOperationDto: UpdateOperationDto, user: any): Promise<generalResponse> {
    try {
      const existingOperation = await this.db.operations.findFirst({ where: { id: id, deleted: false } });
      if (!existingOperation) { throw new HttpException({ status: false, data: null, error: 'Operation not found', msg: 'Operation not found' }, 404); }

      // Validate references if provided
      if (updateOperationDto.lpr_list_id) {
        const existingLprList = await this.db.lpr_list.findFirst({ where: { id: updateOperationDto.lpr_list_id } });
        if (!existingLprList) { throw new HttpException({ status: false, data: null, error: 'LPR List not found', msg: 'LPR List not found' }, 404); }
      }
      if (updateOperationDto.device_id) {
        const existingDevice = await this.db.device.findFirst({ where: { id: updateOperationDto.device_id, deleted: false } });
        if (!existingDevice) { throw new HttpException({ status: false, data: null, error: 'Device not found', msg: 'Device not found' }, 404); }
      }

      // Validate step 2 fields if provided
      if (updateOperationDto.step2_action && !updateOperationDto.step2_delay_ms) {
        throw new HttpException({ status: false, data: null, error: 'Step 2 delay is required when step 2 action is provided', msg: 'Step 2 delay is required when step 2 action is provided' }, 400);
      }
      if (!updateOperationDto.step2_action && updateOperationDto.step2_delay_ms) {
        throw new HttpException({ status: false, data: null, error: 'Step 2 action is required when step 2 delay is provided', msg: 'Step 2 action is required when step 2 delay is provided' }, 400);
      }

      const updateData: any = {};
      if (updateOperationDto.lpr_list_id) updateData.lpr_list_id = updateOperationDto.lpr_list_id;
      if (updateOperationDto.device_id) updateData.device_id = updateOperationDto.device_id;
      if (updateOperationDto.name) updateData.name = updateOperationDto.name;
      if (updateOperationDto.enabled_from) updateData.enabled_from = updateOperationDto.enabled_from;
      if (updateOperationDto.enabled_to) updateData.enabled_to = updateOperationDto.enabled_to;
      if (updateOperationDto.active !== undefined) updateData.active = updateOperationDto.active;
      if (updateOperationDto.port) updateData.port = updateOperationDto.port;
      if (updateOperationDto.step1_action) updateData.step1_action = updateOperationDto.step1_action;
      if (updateOperationDto.step1_delay_ms) updateData.step1_delay_ms = updateOperationDto.step1_delay_ms;
      if (updateOperationDto.step2_action) updateData.step2_action = updateOperationDto.step2_action;
      if (updateOperationDto.step2_delay_ms) updateData.step2_delay_ms = updateOperationDto.step2_delay_ms;
      if (updateOperationDto.cameras) updateData.cameras = JSON.stringify(updateOperationDto.cameras);

      const updatedOperation = await this.db.operations.update({ where: { id: id }, data: updateData });
      await this.loggerService.log(`Operation updated: ${updatedOperation.name}`, 0, user, user.id);
      return { status: true, data: updatedOperation, error: null, msg: null };
    } catch (error) {
      if (error instanceof HttpException) { throw error; }
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  async deleteSingle(user: any, id: string): Promise<generalResponse> {
    try {
      const existingOperation = await this.db.operations.findFirst({ where: { id: id, deleted: false } });
      if (!existingOperation) { throw new HttpException({ status: false, data: null, error: 'Operation not found', msg: 'Operation not found' }, 404); }
      await this.db.operations.update({ where: { id: id }, data: { deleted: true } });
      await this.loggerService.log(`Operation deleted: ${existingOperation.name}`, 0, user, user.id);
      return { status: true, data: null, error: null, msg: null };
    } catch (error) {
      if (error instanceof HttpException) { throw error; }
      throw new HttpException({ status: false, data: null, error: error, msg: error.message }, 406);
    }
  }

  // Non-blocking operation execution
  async executeOperation(operation: any, detectedCameraId?: string): Promise<void> {
    setImmediate(async () => {
      try {
        // Update status to running
        await this.db.operations.update({ where: { id: operation.id }, data: { status: 'running' } });

        // Check if operation is active and within time window
        if (!operation.active) { await this.db.operations.update({ where: { id: operation.id }, data: { status: 'idle' } }); return; }

        const now = new Date();
        const currentTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        if (currentTime < operation.enabled_from || currentTime > operation.enabled_to) {
          await this.db.operations.update({ where: { id: operation.id }, data: { status: 'idle' } });
          return;
        }

        // Check camera restriction if cameras are defined
        if (operation.cameras && operation.cameras.length > 0) {
          const allowedCameras = JSON.parse(operation.cameras);
          if (detectedCameraId && !allowedCameras.includes(detectedCameraId)) {
            await this.db.operations.update({ where: { id: operation.id }, data: { status: 'idle' } });
            return;
          }
        }

        // Get device info
        const device = await this.db.device.findFirst({ where: { id: operation.device_id, deleted: false } });
        if (!device) { await this.db.operations.update({ where: { id: operation.id }, data: { status: 'error' } }); return; }

        // Execute step 1
        await new Promise(resolve => setTimeout(resolve, operation.step1_delay_ms));
        await this.executeDeviceAction(device, operation.port, operation.step1_action);

        // Execute step 2 if exists
        if (operation.step2_action && operation.step2_delay_ms) {
          await new Promise(resolve => setTimeout(resolve, operation.step2_delay_ms));
          await this.executeDeviceAction(device, operation.port, operation.step2_action);
        }

        // Update status to completed
        await this.db.operations.update({ where: { id: operation.id }, data: { status: 'completed' } });

        // Reset status to idle after 5 seconds
        setTimeout(async () => {
          await this.db.operations.update({ where: { id: operation.id }, data: { status: 'idle' } });
        }, 5000);

      } catch (error) {
        console.error('Operation execution error:', error);
        await this.db.operations.update({ where: { id: operation.id }, data: { status: 'error' } });
      }
    });
  }

  private async executeDeviceAction(device: any, port: number, action: string): Promise<void> {
    try {
      switch (action) {
        case 'open':
          await this.devicesService.setDevicePortOpen(device.url, device.username, device.password, port);
          break;
        case 'close':
          await this.devicesService.setDevicePortClose(device.url, device.username, device.password, port);
          break;
        case 'pulse':
          await this.devicesService.setDevicePortPulse(device.url, device.username, device.password, port);
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } catch (error) {
      throw new Error(`Device action failed: ${error.message}`);
    }
  }

  // Method to be called from LPR queue processing
  async processLprDetection(lprListId: string, detectedCameraId?: string): Promise<void> {
    try {
      const operations = await this.db.operations.findMany({
        where: { lpr_list_id: lprListId, deleted: false, active: true }
      });

      for (const operation of operations) {
        this.executeOperation(operation, detectedCameraId);
      }
    } catch (error) {
      console.error('Error processing LPR detection for operations:', error);
    }
  }
}
