import { myDataSource } from "..";
import { PublicStatsCacheTable } from "../../entities";
export const publicStatsCacheRepository = myDataSource.getRepository(
  PublicStatsCacheTable
);
