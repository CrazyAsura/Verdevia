import { getApolloClient } from '@/lib/apollo-client';
import { GET_COURSE, GET_COURSES } from '@/graphql/queries/courses';
import { CREATE_COURSE, DELETE_COURSE, UPDATE_COURSE } from '@/graphql/mutations/courses';

export interface Course {
  id: string;
  title: string;
  description?: string;
  level: string;
  category?: string;
  duration?: string;
  thumbnailUrl?: string;
  modules?: unknown[];
  modulesCount?: number;
  studentsCount?: number;
  createdAt?: string;
}

export interface CoursesResponse {
  items: Course[];
  total: number;
}

const CoursesService = {
  /**
   * Fetches all courses.
   * GraphQL: courses(filter)
   */
  getCourses: async (): Promise<Course[]> => {
    const { data } = await getApolloClient().query({
      query: GET_COURSES,
      variables: { filter: { page: 1, limit: 100 } },
      fetchPolicy: 'network-only',
    });
    return (data as any).courses ?? [];
  },

  /**
   * Fetches a single course by ID.
   * GraphQL: course(id)
   */
  getCourse: async (id: string): Promise<Course> => {
    const { data } = await getApolloClient().query({
      query: GET_COURSE,
      variables: { id },
      fetchPolicy: 'network-only',
    });
    return (data as any).course;
  },

  /**
   * Creates a new course (admin).
   * GraphQL: createCourse
   */
  createCourse: async (data: Partial<Course>): Promise<Course> => {
    const { data: result } = await getApolloClient().mutate({
      mutation: CREATE_COURSE,
      variables: { input: normalizeCourseInput(data, true) },
    });
    return (result as any).createCourse;
  },

  /**
   * Updates a course (admin).
   * GraphQL: updateCourse
   */
  updateCourse: async (id: string, data: Partial<Course>): Promise<Course> => {
    const { data: result } = await getApolloClient().mutate({
      mutation: UPDATE_COURSE,
      variables: { id, input: normalizeCourseInput(data, false) },
    });
    return (result as any).updateCourse;
  },

  /**
   * Deletes a course (admin).
   * GraphQL: removeCourse
   */
  deleteCourse: async (id: string): Promise<{ success: boolean }> => {
    const { data } = await getApolloClient().mutate({
      mutation: DELETE_COURSE,
      variables: { id },
    });
    return (data as any).removeCourse;
  },
};

function normalizeCourseInput(data: Partial<Course>, creating: boolean) {
  const input: Record<string, unknown> = {
    title: data.title,
    description: data.description,
    thumbnailUrl: data.thumbnailUrl,
    category: data.category ?? (creating ? 'ambiental' : undefined),
    level: data.level,
    duration: data.duration ?? (creating ? 'Não informado' : undefined),
    modules: data.modules,
  };

  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined),
  );
}

export default CoursesService;

