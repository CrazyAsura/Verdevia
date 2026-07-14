import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import { User } from '../modules/users/entities/user.entity';
import { Subscription } from '../modules/subscriptions/entities/subscription.entity';
import { Complaint } from '../modules/complaints/entities/complaint.entity';
import { ForumPost } from '../modules/forum/entities/forum-post.entity';
import { Course } from '../modules/courses/entities/course.entity';
import { Achievement } from '../modules/gamification/entities/achievement.entity';
import {
  UserGender,
  UserEthnicity,
  UserRole,
} from '../modules/users/enums/user.enums';
import {
  PollutionType,
  ComplaintStatus,
} from '../modules/complaints/enums/complaint.enums';
import { CourseModule } from '../modules/courses/entities/module.entity';
import { Lesson, LessonType } from '../modules/courses/entities/lesson.entity';
import { Quiz, Question } from '../modules/courses/entities/quiz.entity';
import * as argon2 from 'argon2';
import { createSeedSubscription } from '../modules/subscriptions/plans';

function envOrDefault(key: string, fallback: string) {
  return process.env[key]?.trim() || fallback;
}

const PLATFORM_ADMIN_PASSWORD = 'ECOAAdmin2026Seguro';
const CONTRACTOR_PASSWORD = 'ECOAContratante2026';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  console.log('🚀 Iniciando Mega Seeding ECOA...');

  const userRepo = dataSource.getRepository(User);
  const subscriptionRepo = dataSource.getRepository(Subscription);
  const complaintRepo = dataSource.getRepository(Complaint);
  const courseRepo = dataSource.getRepository(Course);

  // MongoDB Models for Forum
  const forumPostModel = app.get('ForumPostModel');
  const forumCommentModel = app.get('ForumCommentModel');
  const forumRepo = app.get('IForumRepository');

  // 1. Limpeza total (Evitar erros de FK de forma compatível com SQLite e Postgres)
  const isPostgres = dataSource.options.type === 'postgres';
  if (isPostgres) {
    await dataSource.query('SET session_replication_role = replica');
  } else {
    await dataSource.query('PRAGMA foreign_keys = OFF');
  }

  try {
    await dataSource
      .getRepository(Question)
      .createQueryBuilder()
      .delete()
      .execute();
    await dataSource
      .getRepository(Quiz)
      .createQueryBuilder()
      .delete()
      .execute();
    await dataSource
      .getRepository(Lesson)
      .createQueryBuilder()
      .delete()
      .execute();
    await dataSource
      .getRepository(CourseModule)
      .createQueryBuilder()
      .delete()
      .execute();
    await dataSource
      .getRepository(Achievement)
      .createQueryBuilder()
      .delete()
      .execute();

    // Limpeza do Forum (MongoDB)
    await forumPostModel.deleteMany({});
    await forumCommentModel.deleteMany({});

    await dataSource
      .getRepository(Course)
      .createQueryBuilder()
      .delete()
      .execute();
    await dataSource
      .getRepository(Complaint)
      .createQueryBuilder()
      .delete()
      .execute();
    await dataSource
      .getRepository(Subscription)
      .createQueryBuilder()
      .delete()
      .execute();
    await dataSource
      .getRepository(User)
      .createQueryBuilder()
      .delete()
      .execute();
  } finally {
    if (isPostgres) {
      await dataSource.query('SET session_replication_role = default');
    } else {
      await dataSource.query('PRAGMA foreign_keys = ON');
    }
  }

  // 2. Criar Usuários Semeados
  const seedCredentials = {
    admin: {
      email: envOrDefault('SEED_ADMIN_EMAIL', 'admin@ECOA.app'),
      password: envOrDefault('SEED_ADMIN_PASSWORD', PLATFORM_ADMIN_PASSWORD),
      realName: envOrDefault('SEED_ADMIN_NAME', 'Matheus Leon'),
    },
    superAdmin: {
      email: envOrDefault('SEED_SUPER_ADMIN_EMAIL', 'superadmin@ECOA.app'),
      password: envOrDefault('SEED_SUPER_ADMIN_PASSWORD', PLATFORM_ADMIN_PASSWORD),
      realName: envOrDefault('SEED_SUPER_ADMIN_NAME', 'Super Admin'),
    },
    contractor: {
      email: envOrDefault('SEED_CONTRACTOR_EMAIL', 'contractor@ECOA.app'),
      password: envOrDefault('SEED_CONTRACTOR_PASSWORD', CONTRACTOR_PASSWORD),
      realName: envOrDefault('SEED_CONTRACTOR_NAME', 'ConstruEco Ltda'),
    },
    superContractor: {
      email: envOrDefault('SEED_SUPER_CONTRACTOR_EMAIL', 'supercontractor@ECOA.app'),
      password: envOrDefault('SEED_SUPER_CONTRACTOR_PASSWORD', CONTRACTOR_PASSWORD),
      realName: envOrDefault('SEED_SUPER_CONTRACTOR_NAME', 'Holding Master'),
    },
    defaultUserPassword: envOrDefault('SEED_DEFAULT_USER_PASSWORD', 'password123'),
  };

  const adminPassword = await argon2.hash(seedCredentials.admin.password);
  const superAdminPassword = await argon2.hash(seedCredentials.superAdmin.password);
  const contractorPassword = await argon2.hash(seedCredentials.contractor.password);
  const superContractorPassword = await argon2.hash(seedCredentials.superContractor.password);
  const defaultUserPassword = await argon2.hash(seedCredentials.defaultUserPassword);

  // 2.1 Criar Admin com Endereço e Telefone
  const adminData: any = {
    email: seedCredentials.admin.email,
    password: adminPassword,
    role: UserRole.ADMIN,
    gamification: {
      xp: 2500,
      level: 3,
      isPremium: true,
      activeTitle: 'Mestre da Reciclagem',
      avatarFrame: 'https://i.ibb.co/L5TFrv7/eco-frame-gold.png',
    },
    profile: {
      realName: seedCredentials.admin.realName,
      identity: '123.456.789-00',
      gender: UserGender.MASCULINO,
      ethnicity: UserEthnicity.PARDA,
      birthDate: '1995-10-25',
      address: {
        zipCode: '01001-000',
        street: 'Praça da Sé',
        number: '123',
        district: 'Centro',
        city: 'São Paulo',
        state: 'SP',
      },
      phones: [{ ddi: '+55', ddd: '11', number: '98888-8888' }],
    },
    subscription: subscriptionRepo.create(
      createSeedSubscription('admin', 'yearly', 365),
    ),
  };
  const admin = userRepo.create(adminData);
  await userRepo.save(admin);

  // 2.2 Criar Super Admin
  const superAdminData: any = {
    email: seedCredentials.superAdmin.email,
    password: superAdminPassword,
    role: UserRole.SUPER_ADMIN,
    gamification: {
      xp: 9999,
      level: 10,
      isPremium: true,
      activeTitle: 'Guardião da Terra',
    },
    profile: {
      realName: seedCredentials.superAdmin.realName,
      identity: '000.000.000-00',
      gender: UserGender.OUTRO,
      ethnicity: UserEthnicity.INDIGENA,
      birthDate: '1980-01-01',
    },
    subscription: subscriptionRepo.create(
      createSeedSubscription('admin', 'yearly', 365 * 2),
    ),
  };
  const superAdmin = userRepo.create(superAdminData);
  await userRepo.save(superAdmin);

  // 2.3 Criar Super Contractor (Holding)
  const superContractorSub = subscriptionRepo.create(
    createSeedSubscription('super_contractor', 'yearly', 365 * 2),
  );
  const superContractor = userRepo.create({
    email: seedCredentials.superContractor.email,
    password: superContractorPassword,
    role: UserRole.SUPER_CONTRACTOR,
    profile: {
      realName: seedCredentials.superContractor.realName,
      identity: '99.999.999/0001-99',
      gender: UserGender.OUTRO,
      ethnicity: UserEthnicity.BRANCA,
      birthDate: '1990-01-01',
    },
    subscription: superContractorSub,
  });
  await userRepo.save(superContractor);

  // 2.4 Criar Contractor
  const contractorSub = subscriptionRepo.create(
    createSeedSubscription('contractor', 'yearly', 365),
  );
  const contractor = userRepo.create({
    email: seedCredentials.contractor.email,
    password: contractorPassword,
    role: UserRole.CONTRACTOR,
    parentUser: superContractor,
    profile: {
      realName: seedCredentials.contractor.realName,
      identity: '88.888.888/0001-88',
      gender: UserGender.OUTRO,
      ethnicity: UserEthnicity.BRANCA,
      birthDate: '1995-01-01',
    },
    subscription: contractorSub,
  });
  await userRepo.save(contractor);

  // 2.5 Criar Free User (Sem assinatura ativa)
  const freeSub = subscriptionRepo.create(createSeedSubscription('free'));
  const freeUser = userRepo.create({
    email: 'free@ECOA.app',
    password: defaultUserPassword,
    role: UserRole.USER,
    profile: {
      realName: 'Pedro Silva',
      identity: '222.222.222-22',
      gender: UserGender.MASCULINO,
      ethnicity: UserEthnicity.PARDA,
      birthDate: '2000-05-15',
    },
    subscription: freeSub,
  });
  await userRepo.save(freeUser);

  // 2.6 Criar Plus User (Mensalidade Ativa)
  const plusSub = subscriptionRepo.create(
    createSeedSubscription('plus', 'monthly', 30),
  );
  const plusUser = userRepo.create({
    email: 'plus@ECOA.app',
    password: defaultUserPassword,
    role: UserRole.USER,
    profile: {
      realName: 'Ana Souza',
      identity: '333.333.333-33',
      gender: UserGender.FEMININO,
      ethnicity: UserEthnicity.BRANCA,
      birthDate: '1998-08-20',
    },
    subscription: plusSub,
  });
  await userRepo.save(plusUser);

  // 2.7 Criar Pro User (Anuidade Ativa)
  const proSub = subscriptionRepo.create(
    createSeedSubscription('pro', 'yearly', 365),
  );
  const proUser = userRepo.create({
    email: 'pro@ECOA.app',
    password: defaultUserPassword,
    role: UserRole.USER,
    profile: {
      realName: 'Lucas Oliveira',
      identity: '444.444.444-44',
      gender: UserGender.MASCULINO,
      ethnicity: UserEthnicity.PRETA,
      birthDate: '1992-12-05',
    },
    subscription: proSub,
  });
  await userRepo.save(proUser);

  // 2.8 Criar Tester User (Plano Pro Isento — Para testar rotas)
  const testerSub = subscriptionRepo.create({
    ...createSeedSubscription('pro'),
    subscriptionStatus: 'none',
  });
  const testerUser = userRepo.create({
    email: 'tester@ECOA.app',
    password: defaultUserPassword,
    role: UserRole.USER,
    profile: {
      realName: 'Isabela Santos',
      identity: '555.555.555-55',
      gender: UserGender.FEMININO,
      ethnicity: UserEthnicity.AMARELA,
      birthDate: '1996-04-12',
    },
    subscription: testerSub,
  });
  await userRepo.save(testerUser);

  console.log(
    '👤 Usuários Admin, SuperAdmin, Contractors, Plans (Free, Plus, Pro) e Tester criados.',
  );

  // 3. Criar Queixas
  await complaintRepo.save([
    {
      type: PollutionType.URBANO,
      description: 'Acúmulo de entulho e lixo eletrônico atraindo roedores.',
      location: 'Rua das Flores, 450',
      status: ComplaintStatus.PENDENTE,
      latitude: -23.5505,
      longitude: -46.6333,
      user: admin,
      assignedContractor: contractor,
    },
    {
      type: PollutionType.AGUA,
      description: 'Mancha de óleo detectada perto da ponte.',
      location: 'Marginal Pinheiros',
      status: ComplaintStatus.EM_ANALISE,
      latitude: -22.9068,
      longitude: -43.1729,
      user: admin,
    },
    {
      type: PollutionType.INDUSTRIAL,
      description: 'Emissão excessiva de fumaça preta industrial.',
      location: 'Distrito Industrial',
      status: ComplaintStatus.EM_ANALISE,
      latitude: -12.9714,
      longitude: -38.5014,
      user: admin,
      assignedContractor: contractor,
    },
  ] as any);

  // 4. Criar Posts do Fórum
  await forumRepo.save({
    title: 'Dúvida sobre denúncias',
    userName: 'Matheus Leon',
    content: 'Como posso denunciar uma queimada de forma anônima?',
    category: 'Dúvida',
    views: 45,
    likedBy: Array.from({ length: 12 }, (_, i) => `user_${i}`),
    dislikedBy: ['user_dislike_1'],
    shares: 0,
  });

  // 5. Criar Cursos Ecológicos Complexos
  const coursesData = [
    {
      title: 'Sustentabilidade 101',
      level: 'Iniciante',
      duration: '2h 30m',
      category: 'Ecologia',
      description:
        'Um mergulho profundo nos fundamentos da preservação ambiental.',
      thumbnailUrl:
        'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1000',
      modules: [
        {
          title: 'Fundamentos',
          orderIndex: 1,
          lessons: [
            {
              title: 'O Ciclo do Carbono',
              type: LessonType.VIDEO,
              contentUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
              orderIndex: 1,
            },
            {
              title: 'PDF: Guia de Bolso da Sustentabilidade',
              type: LessonType.PDF,
              contentUrl: 'https://www.example.com/guia.pdf',
              orderIndex: 2,
            },
            {
              title: 'Quiz de Introdução',
              type: LessonType.QUIZ,
              orderIndex: 3,
              quiz: {
                title: 'Teste seus conhecimentos iniciais',
                questions: [
                  {
                    text: 'Qual o principal gás causador do efeito estufa?',
                    options: [
                      'Oxigênio',
                      'Gás Carbônico',
                      'Nitrogênio',
                      'Hélio',
                    ],
                    correctAnswerIndex: 1,
                  },
                  {
                    text: 'O que significa o termo "Sustentabilidade"?',
                    options: [
                      'Apenas plantar árvores',
                      'Usar recursos sem comprometer as gerações futuras',
                      'Parar de usar qualquer tecnologia',
                      'Viver em florestas',
                    ],
                    correctAnswerIndex: 1,
                  },
                ],
              },
            },
          ],
        },
      ],
    },
    {
      title: 'Gestão de Resíduos Sólidos',
      level: 'Intermediário',
      duration: '5h 00m',
      category: 'Reciclagem',
      description:
        'Aprenda a gerir resíduos em escala urbana e industrial de forma eficiente.',
      thumbnailUrl:
        'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=1000',
      modules: [
        {
          title: 'A Política Nacional de Resíduos',
          orderIndex: 1,
          lessons: [
            {
              title: 'Introdução à PNRS',
              type: LessonType.TEXT,
              contentBody:
                'A Lei 12.305/10 estabelece diretrizes importantes...',
              orderIndex: 1,
            },
            {
              title: 'Logística Reversa na Prática',
              type: LessonType.VIDEO,
              contentUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
              orderIndex: 2,
            },
          ],
        },
      ],
    },
    {
      title: 'Biodiversidade Urbana',
      level: 'Avançado',
      duration: '4h 15m',
      category: 'Fauna e Flora',
      description:
        'Como integrar a natureza nas grandes metrópoles brasileiras.',
      thumbnailUrl:
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=1000',
      modules: [
        {
          title: 'Ecossistemas Urbanos',
          orderIndex: 1,
          lessons: [
            {
              title: 'Fauna Silvestre em Cidades',
              type: LessonType.VIDEO,
              contentUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
              orderIndex: 1,
            },
          ],
        },
      ],
    },
  ];

  for (const courseData of coursesData) {
    const course = courseRepo.create(courseData);
    await courseRepo.save(course);
  }
  console.log('📚 Cursos ecológicos semeados.');

  // 6. Criar Conquistas
  const achievementRepo = dataSource.getRepository(Achievement);
  await achievementRepo.save([
    {
      icon: 'Zap',
      name: 'Primeira Denúncia',
      status: 'Conquistado',
      date: '10 Jan',
      user: admin,
    },
    {
      icon: 'Star',
      name: 'Eco Guerreiro',
      status: 'Em progresso (8/10)',
      progress: 0.8,
      user: admin,
    },
    {
      icon: 'ShieldCheck',
      name: 'Protector Local',
      status: 'Bloqueado',
      isLocked: true,
      user: admin,
    },
    {
      icon: 'Award',
      name: 'Mestre da Reciclagem',
      status: 'Conquistado',
      date: '05 Mar',
      user: admin,
    },
  ] as any);

  console.log('✨ Mega Seeding Finalizado!');
  await app.close();
  process.exit(0);
}

bootstrap().catch((err) => {
  console.error('❌ Erro no seeding:', err);
  process.exit(1);
});
