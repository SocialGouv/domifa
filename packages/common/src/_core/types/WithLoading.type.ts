type LoadingState = {
  loading: boolean;
};

export type WithLoading<T> = T & LoadingState;
