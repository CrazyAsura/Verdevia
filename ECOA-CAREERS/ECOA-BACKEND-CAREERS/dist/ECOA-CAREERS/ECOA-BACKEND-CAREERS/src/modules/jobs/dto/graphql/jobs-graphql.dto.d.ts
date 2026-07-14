export declare class JobType {
    id: string;
    title: string;
    description: string;
    requirements?: string;
    benefits?: string;
    location?: string;
    salary?: number;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class CreateJobInput {
    title: string;
    description: string;
    requirements?: string;
    benefits?: string;
    location?: string;
    salary?: number;
}
export declare class UpdateJobInput {
    title?: string;
    description?: string;
    requirements?: string;
    benefits?: string;
    location?: string;
    salary?: number;
    status?: string;
}
