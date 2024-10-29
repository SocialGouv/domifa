type LoadingState = {
  loading: boolean;
};

export type WithLoading<T> = T & LoadingState;

export function initializeLoadingState<T>(
  items: T[],
  initialState = false
): WithLoading<T>[] {
  return items.map((item) => ({
    ...item,
    loading: initialState,
  }));
}

export function updateLoadingState<T>(
  items: WithLoading<T>[],
  identifier: (item: T) => boolean,
  loading: boolean
): WithLoading<T>[] {
  return items.map((item) => (identifier(item) ? { ...item, loading } : item));
}
