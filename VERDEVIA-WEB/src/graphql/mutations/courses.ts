import { gql } from '@apollo/client';
import { COURSE_FRAGMENT } from '../queries/courses';

export const CREATE_COURSE = gql`
  ${COURSE_FRAGMENT}
  mutation CreateCourse($input: CreateCourseInput!) {
    createCourse(input: $input) {
      ...CourseFields
    }
  }
`;

export const UPDATE_COURSE = gql`
  ${COURSE_FRAGMENT}
  mutation UpdateCourse($id: ID!, $input: UpdateCourseInput!) {
    updateCourse(id: $id, input: $input) {
      ...CourseFields
    }
  }
`;

export const DELETE_COURSE = gql`
  mutation RemoveCourse($id: ID!) {
    removeCourse(id: $id) {
      success
      message
    }
  }
`;
