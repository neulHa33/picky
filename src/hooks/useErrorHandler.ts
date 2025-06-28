import { useState, useCallback } from 'react';

export function useErrorHandler() {
  const [error, setError] = useState<string | null>(null);

  const showError = useCallback((message: string) => {
    setError(message);
    // Replace with a toast library if desired
    window.alert(message);
  }, []);

  return { error, setError, showError };
} 