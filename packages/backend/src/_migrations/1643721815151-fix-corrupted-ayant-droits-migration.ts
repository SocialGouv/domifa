import { MigrationInterface, QueryRunner } from "typeorm";

export class fixCorruptedAyantDroitsMigration1643721815151
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const usagersToEdit = await queryRunner.query(
      `select ref, "structureId","ayantsDroits"
      from usager u, jsonb_array_elements(u."ayantsDroits") as ad
      where (ad->>'dateNaissance')::text ~ '^([0-9]|[0-2][0-9]|(3)[0-1])(/)(([0-9]|(0)[0-9])|((1)[0-2]))(/)\d{4}$'
      or (ad->>'dateNaissance')::text = null  or (ad->>'dateNaissance')::text = ''`
    );

    const statesToEdit = await queryRunner.query(
      `select uuid,  "states"
      from
      usager_history u,
      jsonb_array_elements(u."states") as state
      join jsonb_array_elements (state->'ayantsDroits') as state_ayant_droit on true
      where
      (state_ayant_droit->>'dateNaissance')::text ~ '^([0-9]|[0-2][0-9]|(3)[0-1])(/)(([0-9]|(0)[0-9])|((1)[0-2]))(/)\d{4}$'
      or
      (state_ayant_droit->>'dateNaissance')::text = null
      group by uuid`
    );

    for (const usager of usagersToEdit) {
      console.log(usager);
      throw new Error("okpokpo");

      // await (
      //   await interactionRepository.typeorm()
      // )
      //   .createQueryBuilder("interactions")
      //   .update()
      //   .set({ interactionOutUUID: interaction.uuid })
      //   .where({
      //     uuid: In(tmpInteractions[oppositeType]),
      //   })
      //   .execute();
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
