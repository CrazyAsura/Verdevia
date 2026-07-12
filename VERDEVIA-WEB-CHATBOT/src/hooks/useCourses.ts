'use client';

import { useQuery, useMutation } from '@apollo/client/react';
import { GET_COURSES, GET_COURSE, GET_LESSON } from '@/graphql/queries/courses';
import { CREATE_COURSE, UPDATE_COURSE, DELETE_COURSE } from '@/graphql/mutations/courses';

interface CoursesFilter {
  page?: number;
  limit?: number;
  category?: string;
  level?: string;
}

export function useCoursesList(filter?: CoursesFilter) {
  const { data, loading, error, refetch } = useQuery<{ courses: any[] }>(GET_COURSES, {
    variables: { filter },
  });

  return {
    courses: data?.courses ?? [],
    loading,
    error,
    refetch,
  };
}

export function useCourseDetails(id: string) {
  const { data, loading, error, refetch } = useQuery<{ course: any }>(GET_COURSE, {
    variables: { id },
    skip: !id,
  });

  return {
    course: data?.course ?? null,
    loading,
    error,
    refetch,
  };
}

export function useLessonDetails(id: string) {
  const { data, loading, error, refetch } = useQuery<{ lesson: any }>(GET_LESSON, {
    variables: { id },
    skip: !id,
  });

  return {
    lesson: data?.lesson ?? null,
    loading,
    error,
    refetch,
  };
}

export function useCourseMutations() {
  const [createMutation, { loading: creating }] = useMutation(CREATE_COURSE, {
    refetchQueries: [{ query: GET_COURSES }],
  });
  const [updateMutation, { loading: updating }] = useMutation(UPDATE_COURSE);
  const [deleteMutation, { loading: deleting }] = useMutation(DELETE_COURSE, {
    refetchQueries: [{ query: GET_COURSES }],
  });

  return {
    createCourse: (input: any) => createMutation({ variables: { input } }),
    updateCourse: (id: string, input: any) => updateMutation({ variables: { id, input } }),
    deleteCourse: (id: string) => deleteMutation({ variables: { id } }),
    creating,
    updating,
    deleting,
  };
}
