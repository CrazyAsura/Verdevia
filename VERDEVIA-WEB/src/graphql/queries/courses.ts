import { gql } from '@apollo/client';

export const QUESTION_FRAGMENT = gql`
  fragment QuestionFields on QuestionType {
    id
    text
    options
    correctAnswerIndex
  }
`;

export const QUIZ_FRAGMENT = gql`
  ${QUESTION_FRAGMENT}
  fragment QuizFields on QuizType {
    id
    title
    passingScore
    questions {
      ...QuestionFields
    }
  }
`;

export const LESSON_FRAGMENT = gql`
  ${QUIZ_FRAGMENT}
  fragment LessonFields on LessonTypeGql {
    id
    title
    type
    contentUrl
    contentBody
    orderIndex
    quiz {
      ...QuizFields
    }
  }
`;

export const MODULE_FRAGMENT = gql`
  ${LESSON_FRAGMENT}
  fragment ModuleFields on ModuleTypeGql {
    id
    title
    orderIndex
    lessons {
      ...LessonFields
    }
  }
`;

export const COURSE_FRAGMENT = gql`
  ${MODULE_FRAGMENT}
  fragment CourseFields on CourseTypeGql {
    id
    title
    description
    thumbnailUrl
    category
    level
    duration
    createdAt
  }
`;

export const GET_COURSES = gql`
  ${COURSE_FRAGMENT}
  query GetCourses($filter: CoursesFilterInput) {
    courses(filter: $filter) {
      ...CourseFields
    }
  }
`;

export const GET_COURSE = gql`
  ${COURSE_FRAGMENT}
  query GetCourse($id: ID!) {
    course(id: $id) {
      ...CourseFields
      modules {
        ...ModuleFields
      }
    }
  }
`;

export const GET_LESSON = gql`
  ${LESSON_FRAGMENT}
  query GetLesson($id: ID!) {
    lesson(id: $id) {
      ...LessonFields
    }
  }
`;
