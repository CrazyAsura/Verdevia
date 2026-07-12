import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AiAnalysisEvent } from '../enums/ai-analysis-event.enum';

const WS_ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5000',
  'http://localhost:8081',
  'http://localhost:19006',
  'https://verdevia.vercel.app',
  'https://verdevia-green.vercel.app',
  ...(process.env.ALLOWED_ORIGINS?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean) ?? []),
];

@WebSocketGateway({
  cors: {
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin) return callback(null, true);
      if (
        process.env.NODE_ENV !== 'production' &&
        (origin.endsWith('.ngrok-free.app') ||
          origin.endsWith('.ngrok-free.dev'))
      ) {
        return callback(null, true);
      }
      if (WS_ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
      callback(new Error(`WebSocket CORS: origin '${origin}' not allowed`));
    },
    credentials: true,
  },
})
export class AiWebSocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AiWebSocketGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Cliente conectado ao AI WS: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado do AI WS: ${client.id}`);
  }

  @SubscribeMessage('ai.analysis.join')
  handleJoinAnalysis(client: Socket, requestId: string) {
    client.join(requestId);
    this.logger.log(`Cliente ${client.id} entrou na sala ${requestId}`);
  }

  emitAnalysisEvent(
    event: AiAnalysisEvent,
    requestId: string,
    payload: Record<string, unknown>,
  ) {
    const eventPayload = {
      requestId,
      timestamp: new Date().toISOString(),
      ...payload,
    };

    this.server.to(requestId).emit(event, eventPayload);
    this.server.emit(event, eventPayload);
  }
}
