import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CandidateAddress } from './entities/candidate-address.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CandidateAddress])],
  exports: [TypeOrmModule],
})
export class CandidateAddressesModule {}
