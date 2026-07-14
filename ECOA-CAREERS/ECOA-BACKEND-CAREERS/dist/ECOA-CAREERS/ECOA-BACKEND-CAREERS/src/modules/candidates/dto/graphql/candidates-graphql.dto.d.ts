export declare class CandidateType {
    id: string;
    name: string;
    email: string;
    phone?: string;
    resumeUrl?: string;
    linkedInUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class CreateCandidateInput {
    name: string;
    email: string;
    phone?: string;
    resumeUrl?: string;
    linkedInUrl?: string;
}
