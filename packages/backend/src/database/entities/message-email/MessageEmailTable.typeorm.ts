import { Column, Entity } from "typeorm";
import { AppTypeormTable } from "../_core/AppTypeormTable.typeorm";
import { MessageEmail } from "./MessageEmail.type";
import { MessageEmailContent } from "./MessageEmailContent.type";
import { MessageEmailId } from "./MessageEmailId.type";
import { MessageEmailSendDetails } from "./MessageEmailSendDetails.type";
import { MessageEmailStatus } from "./MessageEmailStatus.type";
// https://typeorm.io/#/entities/column-types-for-postgres
@Entity({ name: "message_email" })
export class MessageEmailTable<T = any>
  extends AppTypeormTable<MessageEmailTable>
  implements MessageEmail {
  @Column({ type: "text" })
  status: MessageEmailStatus;
  @Column({ type: "text" })
  emailId: MessageEmailId;

  @Column({ type: "timestamptz" })
  initialScheduledDate: Date;
  @Column({ type: "timestamptz" })
  nextScheduledDate: Date;
  @Column({ type: "timestamptz", nullable: true })
  sendDate: Date;

  @Column({ type: "jsonb" })
  content: MessageEmailContent;

  @Column({ type: "integer", default: 0 })
  errorCount: number;
  @Column({ type: "text", nullable: true })
  errorMessage?: string;

  @Column({ type: "jsonb", nullable: true })
  sendDetails: MessageEmailSendDetails;
}
