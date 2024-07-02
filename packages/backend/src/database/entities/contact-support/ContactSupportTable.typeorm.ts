import { BeforeInsert, Column, Entity } from "typeorm";
import {
  ContactCategorie,
  ContactStatus,
  ContactSupport,
} from "../../../_common/model";
import { MessageEmailAttachment } from "../message-email";

import { AppTypeormTable } from "../_core/AppTypeormTable.typeorm";

// https://typeorm.io/#/entities/column-types-for-postgres
@Entity({ name: "contact_support" })
export class ContactSupportTable
  extends AppTypeormTable<ContactSupportTable>
  implements ContactSupport
{
  @Column({ type: "integer", nullable: true })
  public userId: number;

  @Column({ type: "integer", nullable: true })
  public structureId: number;

  // Contenu du message
  @Column({ type: "text" })
  public content: string;

  @Column({ type: "text", default: "ON_HOLD" })
  public status: ContactStatus;

  @Column({ type: "jsonb", nullable: true })
  public attachment?: MessageEmailAttachment;

  @Column({ type: "text" })
  public email: string;

  @Column({ type: "text", nullable: true })
  public category: ContactCategorie;

  @Column({ type: "text" })
  public name: string;

  @Column({ type: "text", nullable: true })
  public structureName: string;

  @Column({ type: "text", nullable: true })
  public comments: string;

  @BeforeInsert()
  nameToUpperCase() {
    this.email = this.email.toLowerCase().trim();
  }
  public constructor(entity?: Partial<ContactSupportTable>) {
    super(entity);
    Object.assign(this, entity);
  }
}
