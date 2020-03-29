import { Connection } from "mongoose";
import { UserSchema } from "./user.schema";

export const UsersProviders = [
  {
    inject: ["DATABASE_CONNECTION"],
    provide: "USER_MODEL",
    useFactory: (connection: Connection) =>
      connection.model("User", UserSchema),
  },
];
