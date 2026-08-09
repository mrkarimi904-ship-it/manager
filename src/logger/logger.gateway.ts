import { WebSocketGateway, SubscribeMessage, MessageBody, OnGatewayConnection, WebSocketServer, OnGatewayDisconnect } from '@nestjs/websockets';

import { Server, Socket } from "socket.io";

import { DbService } from 'src/db/db.service';

import * as jwt from 'jsonwebtoken';
import { jwt_secret } from 'src/app.consts';

import { Cron } from '@nestjs/schedule';

@WebSocketGateway({ cors: true })
export class LoggerGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private db: DbService) {}

  @WebSocketServer() io: Server;

  clients = []

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake?.headers?.authorization?.toString()
      const v = jwt.verify(token, jwt_secret, { complete: true })
      const user_token: any = v.payload;
      const user_id = user_token.id;
      const user = await this.db.user_accounts.findUnique({ where: { id: user_id } });
      if (!user) { client.disconnect(); return false; }
      const stored_token = await this.db.user_tokens.findFirst({ where: { token: token, user_accounts: { some: { id: user.id } } }})
      if (!stored_token) { client.disconnect(); return false; }
      client['user'] = user
      this.clients.push(client)
    } catch (error) {
      client.disconnect()
    }
  }

  handleDisconnect(client: any) {
    const id = client.id
    this.clients = this.clients.filter(x => x.id !== id)
  }

  notify_all(msg) {
    this.clients.forEach(x => {
      x.emit('notify', msg)
    })
  }

  notify_admins(msg) {
    this.clients.forEach(x => {
      const user = x.user
      if (user.isSuperAdmin === true) {
        x.emit('notify', msg)
      }
    })
  }

  notify_user(user_id, msg) {
    this.clients.forEach(x => {
      const user = x.user
      if (user.id === user_id) {
        x.emit('notify', msg)
      }
    })
  }

  @SubscribeMessage('self')
  handleEvent(client: Socket, data: string): string {
    return data;
  }

  @Cron('*/15 * * * * *')
  async handleCron() {
    await Promise.all(this.clients.map(async (client) => {
      const token = client.handshake?.headers?.authorization?.toString()
      const stored_token = await this.db.user_tokens.findFirst({ where: { token: token }})
      if (!stored_token) { client.disconnect() }
    }));
  }

}
