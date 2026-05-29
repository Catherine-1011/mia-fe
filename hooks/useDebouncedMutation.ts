// app/hooks/useDebouncedMutation.ts
import { useRef, useCallback } from "react";
import { useMutation, UseMutationOptions, UseMutationResult } from "@tanstack/react-query";


export function useDebouncedMutation<
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown
>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  delay = 400,
  options?: UseMutationOptions<TData, TError, TVariables, TContext>
): UseMutationResult<TData, TError, TVariables, TContext> & { debouncedMutate: (variables: TVariables) => void } {
  const mutation = useMutation<TData, TError, TVariables, TContext>({
    mutationFn,
    ...options,
  });
  const timeout = useRef<NodeJS.Timeout | null>(null);

  const debouncedMutate = useCallback((variables: TVariables) => {
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      mutation.mutate(variables);
    }, delay);
  }, [mutation, delay]);

  return { ...mutation, debouncedMutate };
}
