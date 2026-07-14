import { Job } from '../../jobs/entities/job.entity';
import { Candidate } from '../../candidates/entities/candidate.entity';
export declare class Application {
    id: string;
    jobId: string;
    candidateId: string;
    status: string;
    feedback: string;
    job: Job;
    candidate: Candidate;
    createdAt: Date;
    updatedAt: Date;
}
