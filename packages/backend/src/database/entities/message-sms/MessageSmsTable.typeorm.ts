import { Column, Entity } from "typeorm";

import { AppTypeormTable } from "../_core/AppTypeormTable.typeorm";
import { MessageSms } from "./MessageSms.type";
import { MessageSmsId } from "./MessageSmsId.type";
import { MessageSmsStatus } from "./MessageSmsStatus.type";
import { MessageStatusUpdate } from "./MessageStatusUpdate.type";

// https://typeorm.io/#/entities/column-types-for-postgres
@Entity({ name: "message_sms" })
export class MessageSmsTable<T = any>
  extends AppTypeormTable<MessageSmsTable>
  implements MessageSms {
  @Column({ type: "text" })
  public content: string;

  @Column({ type: "integer" })
  public usagerRef: number;

  @Column({ type: "integer" })
  public structureId: number;

  @Column({ type: "text" })
  public status: MessageSmsStatus;

  @Column({ type: "text" })
  public smsId: MessageSmsId;

  @Column({ type: "timestamptz" })
  public scheduledDate: Date;

  @Column({ type: "timestamptz", nullable: true })
  public sendDate: Date;

  @Column({ type: "jsonb", nullable: true })
  public statusUpdates: MessageStatusUpdate[];

  @Column({ type: "timestamptz", nullable: true })
  public lastUpdate: Date;

  //
  @Column({ type: "integer", default: 0 })
  public errorCount: number;

  @Column({ type: "text", nullable: true })
  public errorMessage?: string;
}
