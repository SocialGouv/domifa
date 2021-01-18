import { DatabaseModule } from "../../database";
import { UsagersProviders } from "../../usagers/usagers.providers";
import { UsersProviders } from "../../users/users.providers";
import { AppTestContext, AppTestHelper } from "../../util/test";
import { StructureDto } from "../dto/structure.dto";
import { StructuresProviders } from "../structures-providers";
import { StructuresService } from "./structures.service";

describe("Structure Service", () => {
  let service: StructuresService;
  const structureDto = new StructureDto();

  structureDto.nom = "Association Amicale";
  structureDto.structureType = "asso";
  structureDto.adresse = "15 rue des bois";
  structureDto.complementAdresse = "";
  structureDto.codePostal = "75013";
  structureDto.ville = "Paris";
  structureDto.agrement = "10091099191";
  structureDto.departement = "PARIS";
  structureDto.email = "structure@domifa.net";
  structureDto.phone = "0101010101";
  structureDto.responsable = {
    fonction: "Président",
    nom: "Hidalin",
    prenom: "Marc",
  };

  let context: AppTestContext;

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp({
      imports: [DatabaseModule],
      providers: [
        StructuresService,
        ...StructuresProviders,
        ...UsagersProviders,
        ...UsersProviders,
      ],
    });
    service = context.module.get<StructuresService>(StructuresService);
  });
  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
