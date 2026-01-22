import { useCallback, useState } from 'react';

export const useFetch = (asyncFunction) => {
  const [state, setState] = useState({
    data: null,
    error: null,
    isLoading: false,
  });

  const run = useCallback(
    async (...args) => {
      setState({ data: null, error: null, isLoading: true });
      try {
        const data = await asyncFunction(...args);
        setState({ data, error: null, isLoading: false });
        return data;
      } catch (error) {
        setState({ data: null, error, isLoading: false });
        throw error;
      }
    },
    [asyncFunction],
  );

  return { ...state, run };
};
