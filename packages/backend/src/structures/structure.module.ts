import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { StructureSchema } from "./structure.schema";
import { StructuresProviders } from "./structures-providers";
import { StructuresController } from "./structures.controller";
import { StructuresService } from "./structures.service";

@Module({
  controllers: [StructuresController],
  exports: [StructuresService],
  imports: [DatabaseModule],
  providers: [StructuresService, ...StructuresProviders]
})
export class StructuresModule {}
