import { SmsModule } from "./../sms.module";
import { forwardRef } from "@nestjs/common";
import {
  userStructureRepository,
  structureRepository,
  usagerRepository,
  messageSmsRepository,
} from "../../database";
import { InteractionDto } from "../../interactions/dto";
import { InteractionsModule } from "../../interactions/interactions.module";
import {
  InteractionsDeletor,
  interactionsCreator,
} from "../../interactions/services";
import { StructuresModule } from "../../structures/structure.module";
import { UsagersModule } from "../../usagers/usagers.module";
import { UsersModule } from "../../users/users.module";
import { AppTestContext, AppTestHelper } from "../../util/test";
import { UserStructure, Usager } from "../../_common/model";
import { MessageSmsService } from "./message-sms.service";

describe("MessageSmsService", () => {
  let context: AppTestContext;

  let user: UserStructure;
  let usager: Usager;
  let interactionsDeletor: InteractionsDeletor;
  let messageSmsService: MessageSmsService;

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp({
      imports: [
        forwardRef(() => InteractionsModule),
        forwardRef(() => UsagersModule),
        forwardRef(() => UsersModule),
        forwardRef(() => SmsModule),
        forwardRef(() => StructuresModule),
      ],
    });
    messageSmsService =
      context.module.get<MessageSmsService>(MessageSmsService);

    interactionsDeletor =
      context.module.get<InteractionsDeletor>(InteractionsDeletor);

    user = await userStructureRepository.findOne({ id: 1 });
    user.structure = await structureRepository.findOneBy({ id: 1 });

    usager = await usagerRepository.findOneBy({
      ref: 2,
      structureId: 1,
    });
  });

  afterAll(async () => {
    await structureRepository.update(
      { id: user.structureId },
      { sms: user.structure.sms }
    );
    await usagerRepository.update({}, { contactByPhone: false });
    await messageSmsRepository.delete({ structureId: user.structureId });
    await AppTestHelper.tearDownTestApp(context);
  });

  describe("Création de SMS après création d'interaction", () => {
    it("Réception de courrier, création d'un SMS", async () => {
      user.structure.sms = {
        enabledByDomifa: true,
        enabledByStructure: true,
        senderName: "DOMIFA",
        senderDetails: "La direction",
      };

      // Mise à jour des informations pour les SMS
      await structureRepository.update(
        { id: user.structureId },
        { sms: user.structure.sms }
      );

      await usagerRepository.updateOne(
        {
          ref: 2,
          structureId: 1,
        },
        {
          telephone: {
            countryCode: "FR",
            numero: "0606060606",
          },
          contactByPhone: true,
        }
      );

      const newusager = await usagerRepository.findOneBy({
        ref: 2,
        structureId: 1,
      });

      newusager.telephone = {
        countryCode: "FR",
        numero: "0606060606",
      };
      newusager.contactByPhone = true;

      const interaction: InteractionDto = {
        type: "courrierIn",
        content: "Les impôts",
        nbCourrier: 10,
        dateInteraction: new Date(),
      };

      const created = await interactionsCreator.createInteraction({
        usager: newusager,
        interaction,
        user,
      });

      await messageSmsService.updateSmsAfterCreation({
        interaction: created.interaction,
        structure: user.structure,
        usager: newusager,
      });

      const smsOnHold = await messageSmsRepository.findBy({
        usagerRef: usager.ref,
        structureId: user.structureId,
      });

      expect(smsOnHold.length).toEqual(1);

      // clean
      const deletedFirstInteraction =
        await interactionsDeletor.deleteOrRestoreInteraction({
          interaction: created.interaction,
          structure: user.structure,
          usager,
          user,
        });
      expect(deletedFirstInteraction.lastInteraction.courrierIn).toEqual(0);
    });
  });
});
