import { forwardRef } from "@nestjs/common";
import {
  structureRepository,
  usagerRepository,
  userStructureRepository,
} from "../../../database";
import { UsersModule } from "../../../modules/users/users.module";
import { AppTestContext, AppTestHelper } from "../../../util/test";
import { UsagersService } from "../usagers.service";

import { UsagerHistoryStateService } from "../usagerHistoryState.service";
import { UserStructure } from "@domifa/common";
import { UsagersLogsService } from "../usagers-logs.service";
import { AppLogsModule } from "../../../modules/app-logs/app-logs.module";
import CREATE_USAGER_DTO from "./CREATE_USAGER_DTO.const";
import { DecisionDto } from "../../dto";

describe("UsagersService", () => {
  let service: UsagersService;
  let context: AppTestContext;

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp({
      imports: [forwardRef(() => UsersModule), AppLogsModule],
      providers: [
        UsagersService,
        UsagerHistoryStateService,
        UsagersLogsService,
      ],
    });
    service = context.module.get<UsagersService>(UsagersService);
  });
  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("0. Create / Read / Update / Delete", async () => {
    const user = (await userStructureRepository.findOneBy({
      id: 1,
    })) as UserStructure;
    user.structure = await structureRepository.findOneBy({ id: 5 });

    const usagerTest = await service.create(CREATE_USAGER_DTO, user);

    expect(usagerTest).toBeDefined();

    // READ
    const usager = await usagerRepository.findOneBy({
      ref: usagerTest.ref,
      structureId: user.structureId,
    });
    expect(usager).toBeTruthy();
    expect(usager.nom).toEqual(CREATE_USAGER_DTO.nom);
    expect(usager.sexe).toEqual(CREATE_USAGER_DTO.sexe);

    await usagerRepository.delete({ uuid: usager.uuid });

    const deletedUsager = await usagerRepository.findOneBy({
      ref: usagerTest.ref,
      structureId: user.structureId,
    });

    expect(deletedUsager).toBeNull();
  });

  it("1. setDecision refreshes the search index and returns the profile", async () => {
    const user = (await userStructureRepository.findOneBy({
      id: 1,
    })) as UserStructure;
    user.structure = await structureRepository.findOneBy({ id: 5 });

    const created = await service.create(CREATE_USAGER_DTO, user);
    const usager = await usagerRepository.getUsager(created.uuid);

    const updated = await service.setDecision(usager, {
      statut: "VALIDE",
      dateDebut: new Date("2026-01-01"),
      dateFin: new Date("2026-12-31"),
      customRef: "AB-123",
      userId: user.id,
      userName: `${user.prenom} ${user.nom}`,
    } as DecisionDto);

    expect(updated.customRef).toEqual("AB-123");
    expect(updated.statut).toEqual("VALIDE");
    expect(updated.nom).toEqual(usager.nom);
    expect(updated).toHaveProperty("entretien");

    const { nom_prenom_surnom_ref } = await usagerRepository
      .createQueryBuilder("usager")
      .select("usager.nom_prenom_surnom_ref", "nom_prenom_surnom_ref")
      .where("usager.uuid = :uuid", { uuid: usager.uuid })
      .getRawOne();
    expect(nom_prenom_surnom_ref).toContain("ab 123");

    await usagerRepository.delete({ uuid: usager.uuid });
  });

  it("2. setDecision keeps the ref in the search index when there is no customRef", async () => {
    const user = (await userStructureRepository.findOneBy({
      id: 1,
    })) as UserStructure;
    user.structure = await structureRepository.findOneBy({ id: 5 });

    const created = await service.create(CREATE_USAGER_DTO, user);
    await usagerRepository.update({ uuid: created.uuid }, { customRef: null });
    const usager = await usagerRepository.getUsager(created.uuid);

    await service.setDecision(usager, {
      statut: "INSTRUCTION",
    } as DecisionDto);

    const { nom_prenom_surnom_ref } = await usagerRepository
      .createQueryBuilder("usager")
      .select("usager.nom_prenom_surnom_ref", "nom_prenom_surnom_ref")
      .where("usager.uuid = :uuid", { uuid: usager.uuid })
      .getRawOne();
    expect(nom_prenom_surnom_ref.split(" ")).toContain(`${usager.ref}`);

    await usagerRepository.delete({ uuid: usager.uuid });
  });
});
