import { Column, Entity } from "typeorm";
import { ContactSupport } from "../../../_common/model";
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

  @Column({ type: "text" })
  public content: string;

  @Column({ type: "text", nullable: true })
  public subject: string;

  @Column({ type: "jsonb", nullable: true })
  public attachment?: MessageEmailAttachment;

  @Column({ type: "text" })
  public email: string;

  @Column({ type: "text" })
  public name: string;

  @Column({ type: "text", nullable: true })
  public structureName: string;

  public constructor(entity?: Partial<ContactSupportTable>) {
    super(entity);
    Object.assign(this, entity);
  }
}
