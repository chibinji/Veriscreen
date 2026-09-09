import { usersApi } from '../api';
import type { StudentProfile, PageParams, PaginatedResponse } from '../types';

export const studentService = {
  getProfile: () => usersApi.getStudentProfile(),
  updateProfile: (data: Partial<StudentProfile>) => usersApi.updateProfile(data),
  getDashboardStats: () => usersApi.getDashboardStats(),
  getAllStudents: (params: PageParams): Promise<PaginatedResponse<StudentProfile>> =>
    usersApi.getUsers(params).then((page) => ({
      ...page,
      content: [],
    })),
  getStudentByNumber: (studentNumber: string) => usersApi.getStudentByNumber(studentNumber),
  uploadProfilePicture: (file: File) => usersApi.uploadProfilePicture(file),
};
