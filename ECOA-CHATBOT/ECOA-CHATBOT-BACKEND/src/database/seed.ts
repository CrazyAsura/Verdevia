import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';

/**
 * Chatbot domain seed.
 * The Chatbot microservice has no seeded domain entities —
 * AI conversations are ephemeral and stored per-session.
 */
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  console.log('✅ ECOA-Chatbot: Nenhum dado a ser semeado (domínio efêmero).');

  await app.close();
  process.exit(0);
}

bootstrap().catch((err) => {
  console.error('❌ Erro no seeding:', err);
  process.exit(1);
});
