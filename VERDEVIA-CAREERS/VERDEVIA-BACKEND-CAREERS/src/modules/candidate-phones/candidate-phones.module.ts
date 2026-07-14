import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CandidatePhone } from './entities/candidate-phone.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CandidatePhone])],
  exports: [TypeOrmModule],
})
export class CandidatePhonesModule {}
