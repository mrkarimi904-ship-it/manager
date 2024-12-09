import { WebSocketGateway, SubscribeMessage, MessageBody, OnGatewayConnection, WebSocketServer, OnGatewayDisconnect } from '@nestjs/websockets';
import { LoggerService } from './logger.service';

import { Server, Socket } from "socket.io";

import { DbService } from 'src/db/db.service';
import * as jwt from 'jsonwebtoken';
import { jwt_secret } from 'src/app.consts';

@WebSocketGateway({ cors: true })
export class LoggerGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly loggerService: LoggerService, private db: DbService) {}

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
      const stored_token = await this.db.user_tokens.findFirst({ where: { token: token, user_accounts: { every: { id: user.id } } }})
      if (!stored_token) { client.disconnect(); return false; }
      this.clients.push(client)
    } catch (error) {
      client.disconnect()
    }
  }

  handleDisconnect(client: any) {
    const id = client.id
    this.clients = this.clients.filter(x => x.id !== id)
  }

  send(msg) {
    this.clients.forEach(x => {
      x.emit('notify', msg)
    })
  }

  // @SubscribeMessage('findAllLogger')
  // findAll() {
  //   console.log(1)
  //   return {
  //     event: "pong",
  //     data: "Wrong data that will make the test fail",
  //   };
  // }

}
