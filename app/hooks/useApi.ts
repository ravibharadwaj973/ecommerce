// hooks/useApi.ts
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

type ApiState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

export function useApi<T = any>() {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const fetchData = useCallback(async (
    url: string,
    options?: RequestInit,
    showToast: boolean = true
  ): Promise<ApiResponse<T> | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const res = await fetch(url, {
        credentials: 'include',
        cache: 'no-store',
        ...options,
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || `HTTP ${res.status}`);
      }

      setState({
        data: json.data || json,
        loading: false,
        error: null,
      });

      if (showToast && json.message) {
        toast.success(json.message);
      }

      return json;
    } catch (error: any) {
      const errorMessage = error.message || 'An error occurred';
      setState({
        data: null,
        loading: false,
        error: errorMessage,
      });

      if (showToast) {
        toast.error(errorMessage);
      }

      return null;
    }
  }, []);

const postData = useCallback(async (
  url: string,
  body: any,
  options?: RequestInit
) => {
  const isFormData = body instanceof FormData;

  return fetchData(url, {
    method: 'POST',
    headers: isFormData 
      ? options?.headers 
      : { 'Content-Type': 'application/json', ...options?.headers },

    body: isFormData ? body : JSON.stringify(body),
    ...options,
  });
}, [fetchData]);


  const putData = useCallback(async (
    url: string,
    body: any,
    options?: RequestInit
  ) => {
    return fetchData(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: JSON.stringify(body),
      ...options,
    });
  }, [fetchData]);

const patchData = useCallback(async (
  url: string,
  body?: any,
  options?: RequestInit
) => {

  const isFormData = body instanceof FormData;

  return fetchData(url, {
    method: 'PATCH',
    body: isFormData ? body : JSON.stringify(body),

    headers: isFormData
      ? options?.headers // DO NOT set Content-Type manually
      : {
          'Content-Type': 'application/json',
          ...options?.headers,
        },

    ...options,
  });

}, [fetchData]);


  const deleteData = useCallback(async (
    url: string,
    options?: RequestInit
  ) => {
    return fetchData(url, {
      method: 'DELETE',
      ...options,
    });
  }, [fetchData]);

  return {
    ...state,
    fetchData,
    postData,
    putData,
    patchData,
    deleteData,
    reset: () => setState({ data: null, loading: false, error: null }),
  };
}