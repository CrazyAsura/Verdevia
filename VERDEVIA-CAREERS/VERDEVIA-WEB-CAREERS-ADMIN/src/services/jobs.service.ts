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
  phones?: Array<{ ddi?: string; ddd?: string; number?: string }>;
  address?: { zipCode:string; street:string; number:string; complement?:string; district:string; city:string; state:string; country?:string };
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

const GET_APPLICATIONS = gql`
  query GetApplications {
    applications {
      id
      jobId
      candidateId
      status
      feedback
      createdAt
      job {
        id
        title
      }
      candidate {
        id
        name
        email
        phones { ddi ddd number }
        address { zipCode street number complement district city state country }
        resumeUrl
        linkedInUrl
      }
    }
  }
`;

const CREATE_JOB = gql`
  mutation CreateJob($input: CreateJobInput!) {
    createJob(input: $input) {
      id
      title
      status
    }
  }
`;

const UPDATE_JOB = gql`
  mutation UpdateJob($id: ID!, $input: UpdateJobInput!) {
    updateJob(id: $id, input: $input) {
      id
      title
      status
    }
  }
`;

const DELETE_JOB = gql`
  mutation DeleteJob($id: ID!) {
    deleteJob(id: $id)
  }
`;

const UPDATE_APPLICATION_STATUS = gql`
  mutation UpdateApplicationStatus($id: ID!, $input: UpdateApplicationStatusInput!) {
    updateApplicationStatus(id: $id, input: $input) {
      id
      status
      feedback
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
    phones?: Array<{ ddi:string; ddd:string; number:string }>;
    address?: { zipCode:string; street:string; number:string; complement?:string; district:string; city:string; state:string; country?:string };
    resumeUrl?: string;
    linkedInUrl?: string;
  }): Promise<Application> => {
    const { data } = await getApolloClient().mutate({
      mutation: APPLY_FOR_JOB,
      variables: { input },
    });
    return (data as any).applyForJob;
  },

  getApplications: async (): Promise<Application[]> => {
    const { data } = await getApolloClient().query({
      query: GET_APPLICATIONS,
      fetchPolicy: 'network-only',
    });
    return (data as any).applications ?? [];
  },

  createJob: async (input: {
    title: string;
    description: string;
    requirements?: string;
    benefits?: string;
    location?: string;
    salary?: number;
  }): Promise<Job> => {
    const { data } = await getApolloClient().mutate({
      mutation: CREATE_JOB,
      variables: { input },
    });
    return (data as any).createJob;
  },

  updateJob: async (
    id: string,
    input: {
      title?: string;
      description?: string;
      requirements?: string;
      benefits?: string;
      location?: string;
      salary?: number;
      status?: string;
    },
  ): Promise<Job> => {
    const { data } = await getApolloClient().mutate({
      mutation: UPDATE_JOB,
      variables: { id, input },
    });
    return (data as any).updateJob;
  },

  deleteJob: async (id: string): Promise<boolean> => {
    const { data } = await getApolloClient().mutate({
      mutation: DELETE_JOB,
      variables: { id },
    });
    return Boolean((data as any).deleteJob);
  },

  updateApplicationStatus: async (
    id: string,
    status: string,
    feedback?: string,
  ): Promise<Application> => {
    const { data } = await getApolloClient().mutate({
      mutation: UPDATE_APPLICATION_STATUS,
      variables: {
        id,
        input: { status, feedback },
      },
    });
    return (data as any).updateApplicationStatus;
  },
};

export default JobsService;
