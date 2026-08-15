export interface LoginRequest {
  id: string;
  password: string;
}

export interface JwtResponse {
  accessToken: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  program: string;
  enrollmentYear: number;
}

export interface DocumentItem {
  type: string;
  url?: string;
  summary?: string;
  generatedDate: string;
}

export interface Registration {
  id: number;
  academicYear: string;
  semester: number;
  confirmed: boolean;
  registrationDate: string;
}

export interface Fee {
  id: number;
  paymentDate: string;
  amount: number;
  receiptNo: string;
  outstandingBalance: number;
}

export interface Examination {
  id: number;
  academicYear: string;
  eligible: boolean;
  status: string;
}

export interface AcademicResult {
  id: number;
  courseCode: string;
  grade: string;
  credits: number;
}

export interface HelsbApplication {
  id: number;
  applicationStatus: string;
  paymentStatus: string;
  screeningResult: string;
  contractDetails: string;
}

export interface ApiError {
  status: number;
  message: string;
}
