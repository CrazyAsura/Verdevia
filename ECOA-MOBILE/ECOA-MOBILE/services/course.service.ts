import api from './api';

export interface Course {
  id: string;
  title: string;
  level: string;
  modulesCount: number;
  duration: string;
}

const CourseService = {
  getCourses: async () => {
    const res = await api.get<{ items: Course[] } | Course[]>('/courses');
    const data = res.data;
    return Array.isArray(data) ? data : data.items || [];
  },

  getCourseDetail: async (id: string) => {
    const res = await api.get<Course & { description?: string }>(`/courses/${id}`);
    return res.data;
  }
};

export default CourseService;
