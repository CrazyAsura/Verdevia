import { Injectable } from '@nestjs/common';
import { NotificationsGateway } from '../gateways/notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(private readonly gateway: NotificationsGateway) {}

  async notifyUser(
    userId: string,
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info',
  ) {
    const payload = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
    };

    this.gateway.sendToUser(userId, payload);
    return payload;
  }

  async broadcastAction(title: string, message: string) {
    this.gateway.broadcast('global_notification', {
      title,
      message,
      timestamp: new Date(),
    });
  }
}
