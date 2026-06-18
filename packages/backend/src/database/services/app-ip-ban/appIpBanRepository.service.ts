import { myDataSource } from "..";
import { AppIpBanTable } from "../../entities/app-ip-ban/AppIpBanTable.typeorm";

export const appIpBanRepository = myDataSource.getRepository(AppIpBanTable);
