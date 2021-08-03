import { MigrationInterface, QueryRunner } from "typeorm";

// IMPORTANT: utilisé sur les branches PR pour initialiser la bdd: ne pas supprimer!!!
export class copyDataToDatabase1603812391581 implements MigrationInterface {
  name = "copyDataToDatabase1603812391581";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    INSERT INTO public.app_user (uuid,"createdAt","updatedAt","version",email,fonction,"lastLogin",nom,"password",prenom,"role","structureId",mails,"passwordLastUpdate",verified) VALUES    ('663b9baa-2880-406c-a93a-32fe65528037'::uuid,'2020-11-17 14:18:47.658346+01','2020-11-17 14:18:47.658346+01',1,'justeisabelle@yopmail.com',NULL,NULL,'Juste','$2a$10$3yXcVfWYOWsI/KzAwZ0BrOay1Dp/ZOF5RjhLL0QA2Pt7gQVg2U86u','Isabelle','simple',1,'{"guide": false, "import": false}',NULL,true),
    ('d81c5566-94f9-4ee4-ab57-a604a654f79b'::uuid,'2020-11-17 14:32:22.193933+01','2020-11-17 14:39:14.015103+01',17,'roseline.parmentier@yopmail.com',NULL,'2020-11-17 14:39:13.796+01','Roseline','$2a$10$TXuMkCQubGQGHEFZXmekQOKtoZQmA9Dq9KHZRjB4lLuOa6zBKYODy','Parmentier','admin',3,'{"guide": false, "import": false}','2020-11-17 14:39:14.013+01',true),
    ('b0140303-79e3-436c-9c41-1eaefeeaed6e'::uuid,'2020-11-17 14:23:20.248011+01','2020-11-17 14:23:20.257747+01',2,'peter.smith@yopmail.com',NULL,NULL,'Smith','081650dc22d1389c88a23d747b84f8df37d7712985eba94825f97b121413','Peter','responsable',1,'{"guide": false, "import": false}',NULL,true),
    ('d19ece1f-d32b-498c-9427-eb12b1251163'::uuid,'2020-11-17 14:26:29.482634+01','2020-11-17 14:26:29.490297+01',2,'facteur.test@yopmail.com',NULL,NULL,'Test','271404db7f7456f57e0a9045cdd3096988cd43553c3014642b74c7e86cc6','Facteur','facteur',1,'{"guide": false, "import": false}',NULL,false),
    ('44f1cfe8-eae9-49d5-aedb-76dda856c413'::uuid,'2021-02-01 17:12:30.90825+01','2021-02-01 17:13:04.64034+01',2,'test.import@yopmail.com','Testeur',NULL,'Test','$2a$10$G24I3QYBxE9SLpb.hbKmmOVppqz9DjcExg0eOZiulyNcGTPCJrnNe','Import','admin',4,'{"guide": false, "import": false}',NULL,true),
    ('da01f451-9c4f-4f6c-98bb-c635277e33e7'::uuid,'2020-11-17 14:18:47.658346+01','2021-06-28 15:27:26.09598+02',106,'ccastest@yopmail.com',NULL,'2021-06-28 15:27:26.095+02','Roméro','$2a$10$3yXcVfWYOWsI/KzAwZ0BrOay1Dp/ZOF5RjhLL0QA2Pt7gQVg2U86u','Patrick','admin',1,'{"guide": false, "import": false}',NULL,true);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
