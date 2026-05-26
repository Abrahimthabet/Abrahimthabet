import { useAuth } from '@clerk/clerk-expo';
import { useMemo } from 'react';
import { makeApi } from './api';

export function useApi() {
  const { getToken } = useAuth();
  return useMemo(() => makeApi(() => getToken()), [getToken]);
}
