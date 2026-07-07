import { useState, useEffect, useCallback } from 'react';
import CourseService, { Course } from '../services/course.service';

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCourses = useCallback(async () => {
    try {
      const data = await CourseService.getCourses();
      setCourses(data);
    } catch (e) {
      console.error('Error fetching courses:', e);
      setCourses([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCourses();
  }, [fetchCourses]);

  return {
    courses,
    loading,
    refreshing,
    onRefresh
  };
}
