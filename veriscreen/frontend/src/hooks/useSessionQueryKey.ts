import { useAuthStore } from '../store/authStore';

/** Scope cached student data to the signed-in account so another student's profile cannot linger. */
export function useSessionQueryKey(key: string) {
  const sessionId = useAuthStore(
    (state) => state.user?.studentNumber || state.user?.username || '',
  );
  return [key, sessionId] as const;
}
