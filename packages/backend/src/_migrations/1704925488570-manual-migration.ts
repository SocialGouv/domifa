/* eslint-disable @typescript-eslint/no-unused-vars */
import { differenceInCalendarDays } from "date-fns";
import { In, MigrationInterface, QueryRunner } from "typeorm";
import { Usager } from "../_common/model";
import { structureRepository, usagerRepository } from "../database";
import {
  getLastInteractionOut,
  getDateFromUserLogin,
} from "../interactions/services/getLastInteractionDate.service";
import { appLogger } from "../util";

const UUIDS = [
  "'530ce80d-4cd7-4fc1-b5a4-778d3bd2cf66'",
  "'e79337c4-1823-4ac5-99a9-82de8fc543c0'",
  "'faee4ba6-a0aa-4296-bab1-5376f4b0afb0'",
  "'2c1445ac-e725-4d8c-88b9-30612435646a'",
  "'8c229f0a-abf7-4611-832a-127f1825adda'",
  "'ed123385-69a6-4d03-a408-44210e56548f'",
  "'da91b496-63de-4eb4-9cf3-e0fa980dd472'",
  "'af0ead1c-5e51-4d2c-9bbd-0994c3ed7eca'",
  "'d727c02e-fffc-43bb-a013-9303632c700d'",
  "'1ffbb08a-dff0-4e4b-bd6d-84c058a93866'",
  "'75b63de4-0218-413f-821d-edff99ac6702'",
  "'83195384-61ad-45c8-b575-8587710f8d44'",
  "'085aee66-51c6-4f32-b046-61ecaa7f849c'",
  "'224656fa-d0fe-40af-a351-96b7bfcf1d31'",
  "'dd29581b-8a10-42d3-9914-48d21c33b7ad'",
  "'7346c0e9-45fc-4fea-bbf7-cc2241209083'",
  "'babfaa32-1a24-4ed4-9fa3-dce30d30ce17'",
  "'e9424152-5341-4ad4-b9b7-54cff5c89ec5'",
  "'88643b01-e3bf-4a88-b977-daf8fc22bec1'",
  "'9a9e1bae-489a-4444-b887-4534961517fa'",
  "'d74d7564-0664-4d00-bf61-9da212df7713'",
  "'8f5cb030-077d-4c18-912c-97b3e018410d'",
  "'e03504dd-37bf-4c39-b531-8ab9b9ec7acc'",
  "'396fc532-9261-4868-8415-6ee311cfd806'",
  "'d0439dd8-7a9d-40e0-abe8-b0ac720ed924'",
  "'7ae0c777-9457-4923-bec3-d96f75f0f67b'",
  "'db79c800-0bb8-44f4-b58d-8adb5f44cc7c'",
  "'c4bebf92-44d7-46a0-86ab-958aacf702fc'",
  "'0a68cf64-1695-466f-8547-454bbb3ad3ed'",
  "'3ef897de-17be-4da6-afc5-9d159bd6712c'",
  "'bcd03770-660c-4a7e-9626-0493b714efcf'",
  "'5d42c971-1df5-4fc2-822b-81050effcd0a'",
  "'bd2ea4df-98d4-487e-880e-613247232b2c'",
  "'0abc4754-34c0-4ec5-a862-30996f0c110c'",
  "'7f13449a-b62b-486d-b58a-bf6321a6779f'",
  "'4867b6fb-2fd8-428f-8aa1-6b78736ab865'",
  "'0e0fa5cc-8866-4c03-8b18-c324b4c9b31e'",
  "'2ce3f16f-cae5-4542-847e-a1d31e23a26b'",
  "'3e2ad7d4-6693-4d76-851a-2bc81a68f085'",
  "'95b4624e-91cb-464a-8b4e-60c36e0a7259'",
  "'1faad877-fb3f-4ce6-a8cf-f33235f715da'",
  "'ac400545-a3ed-49a5-b9fa-f1bb9ff4a41a'",
  "'0b6aac69-88f8-43d0-9b58-2c1be53fef89'",
  "'ad856284-71e0-401d-9b55-91a614fb6100'",
];

export class ManualMigration1704925488570 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    appLogger.info(`[MIGRATION] nettoyage des dates de dernier passage`);

    const usagers: Usager[] = await usagerRepository.findBy({
      uuid: In(UUIDS),
    });

    await queryRunner.startTransaction();
    const uuidsToEdit = usagers.map((usager) => usager.uuid);

    for (const usager of usagers) {
      usager.lastInteraction.dateInteraction = new Date(
        usager.lastInteraction.dateInteraction
      );

      const structure = await structureRepository.findOneBy({
        id: usager.structureId,
      });
      const dateInteractionOut = await getLastInteractionOut(usager, structure);

      if (
        dateInteractionOut &&
        differenceInCalendarDays(
          new Date(usager.lastInteraction.dateInteraction),
          dateInteractionOut
        ) !== 0 &&
        differenceInCalendarDays(
          dateInteractionOut,
          new Date(usager.decision.dateDebut)
        ) > 0
      ) {
        const dateLogin = await getDateFromUserLogin(usager, structure, null);

        const log = {
          uuid: usager.uuid,
          ref: usager.ref,
          structureId: usager.structureId,
          before: usager.lastInteraction.dateInteraction,
          after: dateInteractionOut,
          dateLogin,
          dateDebut: usager.decision.dateDebut,
          dateDiff: differenceInCalendarDays(
            new Date(usager.lastInteraction.dateInteraction),
            dateInteractionOut
          ),
        };
        console.log(log);

        await usagerRepository.update(
          { uuid: usager.uuid },
          {
            lastInteraction: {
              ...usager.lastInteraction,
              dateInteraction: dateInteractionOut,
            },

            migrated: true,
          }
        );

        console.log();
      }
    }

    await usagerRepository.update(
      { uuid: In(uuidsToEdit) },
      { migrated: true }
    );

    await queryRunner.commitTransaction();
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    //
  }
}
