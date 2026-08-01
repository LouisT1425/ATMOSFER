import { useEffect, useRef, useState } from "react";

interface QueryState<T> {
  data: T | undefined;
  isLoading: boolean;
  isFetching: boolean;
  error: string | undefined;
}

/**
 * Minimal data-fetching hook: keeps the last successful payload on screen
 * while a refetch is in flight (isFetching) instead of flashing a skeleton,
 * per the dashboard's "refetch keeps the frame" rule.
 */
export function useQuery<T>(fetcher: () => Promise<T>, deps: unknown[]): QueryState<T> {
  const [data, setData] = useState<T>();
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string>();
  const requestId = useRef(0);

  useEffect(() => {
    let cancelled = false;
    const id = ++requestId.current;
    setIsFetching(true);
    setError(undefined);

    fetcher()
      .then((result) => {
        if (cancelled || id !== requestId.current) return;
        setData(result);
        setIsLoading(false);
        setIsFetching(false);
      })
      .catch((err: Error) => {
        if (cancelled || id !== requestId.current) return;
        setError(err.message || "Erreur de chargement");
        setIsLoading(false);
        setIsFetching(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, isLoading, isFetching, error };
}
