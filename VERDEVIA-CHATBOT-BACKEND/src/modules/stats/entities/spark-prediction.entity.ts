import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('spark_predictions')
export class SparkPrediction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('double precision', { nullable: true })
  latitude: number;

  @Column('double precision', { nullable: true })
  longitude: number;

  @Column('integer', { nullable: true })
  clusterId: number;

  @Column({ name: 'prediction_label', nullable: true })
  predictionLabel: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
