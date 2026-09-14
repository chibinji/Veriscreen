/**
 * API surface used by the frontend.
 *
 * Student login, profile, documents, academic records, and HELSB status
 * call the Spring Boot backend. Other modules keep the previous local mock
 * until matching backend endpoints exist.
 */
export { authApi } from './authApi';
export { usersApi } from './usersApi';
export { documentsApi } from './documentsApi';
export { helsbApi } from './helsbApi';
export { notificationsApi } from './notificationsApi';
export { adminApi } from './adminApi';
export { verificationApi } from './verificationApi';
export { ApiException } from './mockClient';
