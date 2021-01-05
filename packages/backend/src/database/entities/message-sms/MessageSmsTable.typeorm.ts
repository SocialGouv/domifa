import { Column, Entity } from "typeorm";

import { AppTypeormTable } from "../_core/AppTypeormTable.typeorm";
import { MessageSms } from "./MessageSms.type";
import { MessageSmsId } from "./MessageSmsId.type";
import { MessageSmsStatus } from "./MessageSmsStatus.type";

// https://typeorm.io/#/entities/column-types-for-postgres
@Entity({ name: "message_sms" })
export class MessageSmsTable<T = any>
  extends AppTypeormTable<MessageSmsTable>
  implements MessageSms {
  @Column({ type: "text" })
  status: MessageSmsStatus;
  @Column({ type: "text" })
  emailId: MessageSmsId;

  @Column({ type: "timestamptz" })
  initialScheduledDate: Date;
  @Column({ type: "timestamptz" })
  nextScheduledDate: Date;
  @Column({ type: "timestamptz", nullable: true })
  sendDate: Date;

  @Column({ type: "integer", default: 0 })
  errorCount: number;
  @Column({ type: "text", nullable: true })
  errorMessage?: string;
}
