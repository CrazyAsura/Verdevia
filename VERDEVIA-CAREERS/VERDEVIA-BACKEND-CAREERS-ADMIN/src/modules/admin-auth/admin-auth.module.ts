import { Module } from '@nestjs/common';
import { SecurityModule } from '../../common/security/security.module';
import { AdminAuthResolver } from './admin-auth.resolver';

@Module({ imports: [SecurityModule], providers: [AdminAuthResolver] })
export class AdminAuthModule {}
