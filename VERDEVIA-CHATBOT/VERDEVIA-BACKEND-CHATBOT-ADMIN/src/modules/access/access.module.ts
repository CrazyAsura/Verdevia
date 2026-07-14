import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessController } from './access.controller';
import { AccessService } from './access.service';
import { AdminAccount } from './entities/admin-account.entity';
import { DocumentPermission } from './entities/document-permission.entity';
@Module({ imports: [TypeOrmModule.forFeature([AdminAccount, DocumentPermission])], controllers: [AccessController], providers: [AccessService], exports: [AccessService] })
export class AccessModule {}
