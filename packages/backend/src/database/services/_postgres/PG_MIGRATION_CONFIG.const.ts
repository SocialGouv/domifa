import { DataSource } from "typeorm";
import { PG_CONNECT_OPTIONS } from "./PG_CONNECT_OPTIONS.const";

export default new DataSource(PG_CONNECT_OPTIONS);
