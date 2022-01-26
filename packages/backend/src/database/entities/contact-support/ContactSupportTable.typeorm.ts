import { MessageEmailAttachement } from "./../message-email/MessageEmailAttachement.type";
import { Column, Entity, Index } from "typeorm";
import {
  ContactCategorie,
  ContactStatus,
  ContactSupport,
} from "../../../_common/model";

import { AppTypeormTable } from "../_core/AppTypeormTable.typeorm";

// https://typeorm.io/#/entities/column-types-for-postgres
@Entity({ name: "contact_support" })
export class ContactSupportTable
  extends AppTypeormTable<ContactSupportTable>
  implements ContactSupport
{
  // Infos user
  @Column({ type: "integer", nullable: true })
  @Index()
  public userId: number;

  @Column({ type: "integer", nullable: true })
  @Index()
  public structureId: number;

  // Contenu du message
  @Column({ type: "text" })
  public content: string;

  @Column({ type: "text", default: "ON_HOLD" })
  @Index()
  public status: ContactStatus;

  @Column({ type: "jsonb", nullable: true })
  public attachement?: MessageEmailAttachement;

  @Column({ type: "text" })
  public email: string;

  @Column({ type: "text", nullable: true })
  public category: ContactCategorie;

  @Column({ type: "text" })
  public name: string;

  @Column({ type: "text", nullable: true })
  public comments: string;

  public constructor(entity?: Partial<ContactSupportTable>) {
    super(entity);
    Object.assign(this, entity);
  }
}
