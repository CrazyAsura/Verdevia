import { SetMetadata } from '@nestjs/common';

export const KAFKA_LOG_METADATA = 'kafka_log_metadata';

export interface KafkaLogOptions {
  action?: string;
}

/**
 * Decorator para marcar métodos de controllers REST ou resolvers GraphQL
 * que devem disparar auditoria detalhada via Kafka e Telemetria para
 * papéis críticos (super_admin, super_contractor e subordinados).
 *
 * Exemplo de uso:
 *   @KafkaLog('atualizar_perfil_usuario')
 *   async updateUserProfile(...) { ... }
 */
export const KafkaLog = (options?: KafkaLogOptions | string) => {
  const actionName = typeof options === 'string' ? options : options?.action;
  return SetMetadata(KAFKA_LOG_METADATA, { actionName });
};
