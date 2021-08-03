import { MigrationInterface, QueryRunner } from "typeorm";

// IMPORTANT: utilisé sur les branches PR pour initialiser la bdd: ne pas supprimer!!!
export class copyDataToDatabase1603812391581 implements MigrationInterface {
  name = "copyDataToDatabase1603812391581";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    INSERT INTO public.message_email (uuid,"createdAt","updatedAt","version",status,"emailId","initialScheduledDate","nextScheduledDate","sendDate","content","errorCount","errorMessage","sendDetails",attachments) VALUES
	 ('1a8fc8f6-bc6b-40fb-b2ed-b4e1af5cb4b5'::uuid,'2021-01-26 10:04:24.386282+01','2021-01-26 10:04:24.386282+01',1,'pending','user-reset-password','2021-01-26 10:04:24.381+01','2021-01-26 10:04:24.381+01',NULL,'{"to": [{"address": "ccastest@yopmail.com", "personalName": "Roméro Patrick"}], "from": {"personalName": "Domifa"}, "replyTo": {"personalName": "Domifa"}, "subject": "Demande d''un nouveau mot de passe", "tipimailModels": [{"email": "ccastest@yopmail.com", "values": {"lien": "http://localhost:4200/reset-password/3d6a46c1ce375273a5db76838c6b5c73feb0bf97f88fa40698b67c2a97eb", "prenom": "Patrick"}, "subject": "Demande d''un nouveau mot de passe"}], "tipimailTemplateId": "users-nouveau-mot-de-passe"}',0,NULL,NULL,NULL),
	 ('3192eafb-b86d-4f2f-ad6c-f7f7df01508a'::uuid,'2021-02-01 17:12:30.914556+01','2021-02-01 17:12:30.914556+01',1,'pending','structure-created','2021-02-01 17:12:30.914+01','2021-02-01 17:12:30.914+01',NULL,'{"to": [{"personalName": "Domifa"}], "from": {"personalName": "Domifa"}, "replyTo": {"personalName": "Domifa"}, "subject": "Nouvelle structure sur Domifa ", "tipimailModels": [{"meta": {}, "values": {"email": "test.import@yopmail.com", "phone": "0101010101", "ville": "Nantes", "adresse": "rue de l''import", "user_nom": "Test", "user_email": "test.import@yopmail.com", "code_postal": "44000", "departement": "Loire-Atlantique", "user_prenom": "Import", "structure_name": "Structure de Test d''import", "structure_type": "Organisme agrée", "responsable_nom": "Test", "lien_suppression": "http://localhost:4200/structures/delete/4/63ba3e786570cfc32fdc9d2d46b365cb23d4b955df308579ffd0ab0f23c7", "lien_confirmation": "http://localhost:4200/structures/confirm/4/63ba3e786570cfc32fdc9d2d46b365cb23d4b955df308579ffd0ab0f23c7", "responsable_prenom": "Import", "responsable_fonction": "Testeur"}, "subject": "Nouvelle structure sur Domifa "}], "tipimailTemplateId": "domifa-nouvelle-structure"}',0,NULL,NULL,NULL),
	 ('3e6f55be-2f38-4dad-8bcf-16551f9154e7'::uuid,'2021-02-01 17:13:04.645677+01','2021-02-01 17:13:04.645677+01',1,'pending','user-account-activated','2021-02-01 17:13:04.644+01','2021-02-01 17:13:04.644+01',NULL,'{"to": [{"address": "test.import@yopmail.com", "personalName": "Import Test"}], "from": {"personalName": "Domifa"}, "replyTo": {"personalName": "Domifa"}, "subject": "Votre compte Domifa a été activé", "tipimailModels": [{"meta": {}, "email": "test.import@yopmail.com", "values": {"lien": "http://localhost:4200/", "prenom": "Import", "nom_structure": "Structure de Test d''import"}, "subject": "Votre compte Domifa a été activé"}], "tipimailTemplateId": "users-compte-active"}',0,NULL,NULL,NULL);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
