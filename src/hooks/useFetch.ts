import { useState, useEffect, useCallback, useRef } from 'react';

interface UseFetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

interface UseFetchState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useFetch<T>(url: string, options?: UseFetchOptions) {
  const [state, setState] = useState<UseFetchState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const isMountedRef = useRef(true);
  const cacheRef = useRef<Map<string, T>>(new Map());

  const fetchData = useCallback(async () => {
    // Check cache
    if (cacheRef.current.has(url)) {
      setState({
        data: cacheRef.current.get(url) || null,
        loading: false,
        error: null,
      });
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch(url, {
        method: options?.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        body: options?.body ? JSON.stringify(options.body) : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = (await response.json()) as T;

      if (isMountedRef.current) {
        cacheRef.current.set(url, data);
        setState({
          data,
          loading: false,
          error: null,
        });
        options?.onSuccess?.(data);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));

      if (isMountedRef.current) {
        setState({
          data: null,
          loading: false,
          error,
        });
        options?.onError?.(error);
      }
    }
  }, [url, options]);

  useEffect(() => {
    isMountedRef.current = true;

    if (options?.immediate !== false) {
      fetchData();
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchData, options?.immediate]);

  return {
    ...state,
    refetch: fetchData,
  };
}
