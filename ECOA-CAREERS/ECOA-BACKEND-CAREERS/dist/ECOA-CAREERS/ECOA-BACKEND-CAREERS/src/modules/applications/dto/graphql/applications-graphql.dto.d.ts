import { JobType } from '../../jobs/dto/graphql/jobs-graphql.dto';
import { CandidateType } from '../../candidates/dto/graphql/candidates-graphql.dto';
export declare class ApplicationType {
    id: string;
    jobId: string;
    candidateId: string;
    status: string;
    feedback?: string;
    job?: JobType;
    candidate?: CandidateType;
    createdAt: Date;
    updatedAt: Date;
}
export declare class ApplyForJobInput {
    jobId: string;
    name: string;
    email: string;
    phone?: string;
    resumeUrl?: string;
    linkedInUrl?: string;
}
export declare class UpdateApplicationStatusInput {
    status: string;
    feedback?: string;
}
