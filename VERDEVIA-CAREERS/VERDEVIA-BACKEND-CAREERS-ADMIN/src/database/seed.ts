import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import { Job } from '../modules/jobs/entities/job.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  console.log('🚀 Iniciando Seeding VERDEVIA-Careers...');

  const jobRepo = dataSource.getRepository(Job);

  // Limpa vagas existentes
  await jobRepo.createQueryBuilder().delete().execute();

  // Cria vagas de exemplo
  await jobRepo.save([
    jobRepo.create({
      title: 'Desenvolvedor Fullstack Sênior',
      description:
        'Precisamos de um desenvolvedor experiente em NestJS e Next.js para escalar nossa plataforma ambiental.',
      requirements: 'Mínimo 4 anos de experiência. Domínio de TypeScript, GraphQL e Docker.',
      benefits: 'Plano de saúde, vale-alimentação, home office integral e stock options.',
      salaryRange: 'R$ 12.000 – R$ 18.000',
      location: 'Remoto (Brasil)',
      type: 'CLT',
      isActive: true,
    }),
    jobRepo.create({
      title: 'Designer de UX/UI',
      description:
        'Junte-se ao nosso time de produto para criar experiências visuais de alto impacto para o ecossistema VERDEVIA.',
      requirements: 'Portfólio de projetos digitais. Experiência com Figma, Design Systems e pesquisa com usuários.',
      benefits: 'Vale-refeição, plano odontológico e horário flexível.',
      salaryRange: 'R$ 7.000 – R$ 11.000',
      location: 'São Paulo, SP (Híbrido)',
      type: 'CLT',
      isActive: true,
    }),
  ]);

  console.log('✅ Vagas de exemplo criadas com sucesso!');
  await app.close();
  process.exit(0);
}

bootstrap().catch((err) => {
  console.error('❌ Erro no seeding:', err);
  process.exit(1);
});
