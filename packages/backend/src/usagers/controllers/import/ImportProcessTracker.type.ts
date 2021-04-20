export type ImportProcessTracker = {
  start: Date;
  end?: Date;
  duration?: number;
  read?: {
    start: Date;
    end?: Date;
    duration?: number;
  };
  parse?: {
    start: Date;
    end?: Date;
    duration?: number;
  };
  build?: {
    start: Date;
    end?: Date;
    duration?: number;
  };
  persist?: {
    start: Date;
    end?: Date;
    duration?: number;
  };
  data?: {
    count: number;
  };
};
