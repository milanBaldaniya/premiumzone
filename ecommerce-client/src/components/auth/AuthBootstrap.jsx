'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMeQuery } from '@/store/api/authApi';
import {
  hydrate,
  setUser,
  setInitialized,
  selectIsAuth,
  readStoredAuth,
} from '@/store/slices/authSlice';

/**
 * Hydrates auth from localStorage on mount (never during render, to keep SSR
 * and the first client render identical), then refreshes the current user
 * from the server. Renders nothing.
 */
export default function AuthBootstrap() {
  const dispatch = useDispatch();
  const isAuth = useSelector(selectIsAuth);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = readStoredAuth();
    if (stored.accessToken) dispatch(hydrate(stored));
    setHydrated(true);
  }, [dispatch]);

  const { data } = useMeQuery(undefined, { skip: !hydrated || !isAuth });

  useEffect(() => {
    if (data?.data?.user) dispatch(setUser(data.data.user));
    if (hydrated) dispatch(setInitialized());
  }, [data, hydrated, dispatch]);

  return null;
}
