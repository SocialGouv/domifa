import { usagerRepository } from "./../database/services/usager/usagerRepository.service";
import { MigrationInterface, QueryRunner } from "typeorm";
import { usagerHistoryRepository } from "../database";
import { Usager, UsagerHistory } from "../_common/model";

export class fixCorruptedAyantDroitsMigration1643721815151
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const usagersToEdit: Pick<
      Usager,
      "uuid" | "structureId" | "ayantsDroits"
    >[] = await (
      await usagerRepository.typeorm()
    ).query(`
        SELECT "uuid", "structureId", "ayantsDroits"
        FROM usager u
        join jsonb_array_elements(u."ayantsDroits") as ad on true
        WHERE (ad->>'dateNaissance')::text \~ ('^([0-9]|[0-2][0-9]|(3)[0-1])(/)(([0-9]|(0)[0-9])|((1)[0-2]))(/)\\d{4}$')
        or
        (ad->>'dateNaissance')::text = null
        or
        (ad->>'dateNaissance')::text = ''
    group by uuid
    `);
    console.log(usagersToEdit);

    for (const usager of usagersToEdit) {
      console.log(" ");
      console.log(" ");
      console.log(usager.ayantsDroits);

      for (const ayantDroit of usager.ayantsDroits) {
        const dateParts = ayantDroit.dateNaissance.toString().split("/");
        const newDateEn = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
        console.log("Avant : " + ayantDroit.dateNaissance);
        console.log("Après : " + newDateEn);
        console.log("------ ");
        ayantDroit.dateNaissance = new Date(newDateEn);
      }

      await (
        await usagerRepository.typeorm()
      ).update(
        {
          uuid: usager.uuid,
        },
        {
          ayantsDroits: usager.ayantsDroits,
        }
      );
    }

    const statesToEdit: UsagerHistory[] = await (
      await usagerHistoryRepository.typeorm()
    ).query(`select uuid,  "states"
      from
      usager_history u,
      jsonb_array_elements(u."states") as state
      join jsonb_array_elements (state->'ayantsDroits') as state_ayant_droit on true
      where
      (state_ayant_droit->>'dateNaissance')::text \~ '^([0-9]|[0-2][0-9]|(3)[0-1])(/)(([0-9]|(0)[0-9])|((1)[0-2]))(/)\\d{4}$'
      or
      (state_ayant_droit->>'dateNaissance')::text = null
      or
      (state_ayant_droit->>'dateNaissance')::text = ''
      group by uuid`);

    for (const usagerState of statesToEdit) {
      for (const state of usagerState.states) {
        for (const ayantDroit of state.ayantsDroits) {
          const dateParts = ayantDroit.dateNaissance.toString().split("/");
          const newDateEn = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

          console.log("Avant : " + ayantDroit.dateNaissance);
          console.log("Après : " + newDateEn);
          console.log("------ ");

          ayantDroit.dateNaissance = new Date(newDateEn);
        }
      }

      await (
        await usagerHistoryRepository.typeorm()
      ).update({ uuid: usagerState.uuid }, { states: usagerState.states });
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
