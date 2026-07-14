import { getApolloClient } from '@/lib/apollo-client';
import { gql } from '@apollo/client/core';

export interface Job {
  id: string;
  title: string;
  description: string;
  requirements?: string;
  benefits?: string;
  location?: string;
  salary?: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  linkedInUrl?: string;
}

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  status: string;
  feedback?: string;
  createdAt: string;
  job?: Job;
  candidate?: Candidate;
}

const GET_JOBS = gql`
  query GetJobs {
    jobs {
      id
      title
      description
      requirements
      benefits
      location
      salary
      status
      createdAt
      updatedAt
    }
  }
`;

const APPLY_FOR_JOB = gql`
  mutation ApplyForJob($input: ApplyForJobInput!) {
    applyForJob(input: $input) {
      id
      status
      createdAt
    }
  }
`;

const JobsService = {
  getJobs: async (): Promise<Job[]> => {
    const { data } = await getApolloClient().query({
      query: GET_JOBS,
      fetchPolicy: 'network-only',
    });
    return (data as any).jobs ?? [];
  },

  applyForJob: async (input: {
    jobId: string;
    name: string;
    email: string;
    phone?: string;
    resumeUrl?: string;
    linkedInUrl?: string;
    lgpdConsent: boolean;
  }): Promise<Application> => {
    const { data } = await getApolloClient().mutate({
      mutation: APPLY_FOR_JOB,
      variables: { input },
    });
    return (data as any).applyForJob;
  },
};

export default JobsService;
