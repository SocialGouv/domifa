import * as mongoose from "mongoose";

export const databaseProviders = [
  {
    provide: "DATABASE_CONNECTION",
    useFactory: async (): Promise<typeof mongoose> =>
      mongoose.connect("mongodb://127.0.0.1:27017/domifa", {
        reconnectInterval: 1000,
        reconnectTries: Number.MAX_VALUE
      })
  }
];
