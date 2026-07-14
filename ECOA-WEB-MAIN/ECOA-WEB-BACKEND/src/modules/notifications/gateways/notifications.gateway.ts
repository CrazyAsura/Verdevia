import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

// Base allowed origins — includes Expo Web dev server (8081) and prod URLs
const WS_ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5000',
  'http://localhost:8081', // Expo Web (dev)
  'http://localhost:19006', // Expo Web (legacy)
  'https://ECOA.vercel.app',
  'https://ECOA-green.vercel.app',
  // Additional origins from env (supports ngrok tunnels, staging URLs, etc.)
  ...(process.env.ALLOWED_ORIGINS?.split(',')
    .map((o) => o.trim())
    .filter(Boolean) ?? []),
];

@WebSocketGateway({
  cors: {
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Allow requests with no origin (native mobile apps, Postman, curl)
      if (!origin) return callback(null, true);
      // Allow any ngrok tunnel in development
      if (
        process.env.NODE_ENV !== 'production' &&
        origin.endsWith('.ngrok-free.app')
      ) {
        return callback(null, true);
      }
      if (WS_ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
      callback(new Error(`WebSocket CORS: origin '${origin}' not allowed`));
    },
    credentials: true,
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('NotificationsGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(client: Socket, userId: string) {
    client.join(userId);
    this.logger.log(`Usuário ${userId} entrou na sua sala de notificações.`);
  }

  sendToUser(userId: string, payload: any) {
    this.server.to(userId).emit('notification', payload);
  }

  broadcast(event: string, payload: any) {
    this.server.emit(event, payload);
  }
}
