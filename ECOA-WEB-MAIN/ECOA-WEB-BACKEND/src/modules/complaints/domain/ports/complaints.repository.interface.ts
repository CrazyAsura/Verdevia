import { Complaint } from '../../entities/complaint.entity';

export interface IComplaintsRepository {
  findAll(
    page: number,
    limit: number,
    search?: string,
    status?: string,
  ): Promise<{ items: Complaint[]; total: number; lastPage: number }>;
  findById(id: string): Promise<Complaint | null>;
  create(complaint: Partial<Complaint>): Promise<Complaint>;
  update(id: string, complaint: Partial<Complaint>): Promise<Complaint>;
  delete(id: string): Promise<boolean>;
}
