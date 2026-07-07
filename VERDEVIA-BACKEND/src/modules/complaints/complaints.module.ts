import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Complaint } from './entities/complaint.entity';
import { ComplaintsController } from './controllers/complaints.controller';
import { ComplaintsService } from './services/complaints.service';
import { ComplaintsResolver } from './resolvers/complaints.resolver';
import { AIModule } from '../ai/ai.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { TypeORMComplaintsRepository } from './infrastructure/persistence/typeorm-complaints.repository';
import { FindAllComplaintsUseCase } from './use-cases/find-all-complaints.usecase';
import { CreateComplaintUseCase } from './use-cases/create-complaint.usecase';
import { FindOneComplaintUseCase } from './use-cases/find-one-complaint.usecase';
import { UpdateComplaintUseCase } from './use-cases/update-complaint.usecase';
import { RemoveComplaintUseCase } from './use-cases/remove-complaint.usecase';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Complaint]),
    AIModule,
    NotificationsModule,
    SubscriptionsModule,
  ],
  controllers: [ComplaintsController],
  providers: [
    ComplaintsService,
    ComplaintsResolver,
    {
      provide: 'IComplaintsRepository',
      useClass: TypeORMComplaintsRepository,
    },
    FindAllComplaintsUseCase,
    CreateComplaintUseCase,
    FindOneComplaintUseCase,
    UpdateComplaintUseCase,
    RemoveComplaintUseCase,
  ],
  exports: [ComplaintsService],
})
export class ComplaintsModule {}
