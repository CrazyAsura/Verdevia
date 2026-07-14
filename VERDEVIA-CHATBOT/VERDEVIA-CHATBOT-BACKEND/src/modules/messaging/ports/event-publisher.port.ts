export interface EventPayload<T = Record<string, any>> {
  readonly id: string;
  readonly timestamp: number;
  readonly traceId: string;
  readonly payload: T;
}

export interface EventPublisherPort {
  publish(topic: string, event: EventPayload): Promise<void>;
  disconnect(): Promise<void>;
}

export const EVENT_PUBLISHER_PORT = 'EventPublisherPort';
