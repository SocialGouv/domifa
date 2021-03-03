import { Column, Entity } from "typeorm";
import {
  MessageSms,
  MessageSmsStatus,
  MessageSmsId,
  MessageSmsUpdate,
  MessageSmsInteractionMetas,
  MessageSmsReminderMetas,
} from "../../../_common/model/message-sms";

import { AppTypeormTable } from "../_core/AppTypeormTable.typeorm";

// https://typeorm.io/#/entities/column-types-for-postgres
@Entity({ name: "message_sms" })
export class MessageSmsTable<T = any>
  extends AppTypeormTable<MessageSmsTable>
  implements MessageSms {
  // Infos usager
  @Column({ type: "integer" })
  public usagerRef: number;

  @Column({ type: "integer" })
  public structureId: number;

  // Contenu du message
  @Column({ type: "text" })
  public content: string;

  @Column({ type: "text", default: "TO_SEND" })
  public status: MessageSmsStatus;

  @Column({ type: "text" })
  public smsId: MessageSmsId;

  @Column({ type: "timestamptz" })
  public scheduledDate: Date;

  @Column({ type: "timestamptz", nullable: true })
  public sentDate: Date;

  // Metas selon le contexte
  @Column({ type: "jsonb", nullable: true })
  public interactionMetas: MessageSmsInteractionMetas;

  @Column({ type: "jsonb", nullable: true })
  public reminderMetas: MessageSmsReminderMetas;

  @Column({ type: "jsonb", nullable: true })
  public statusUpdates: MessageSmsUpdate[];

  @Column({ type: "timestamptz", nullable: true })
  public lastUpdate: Date;

  //
  @Column({ type: "integer", default: 0 })
  public errorCount: number;

  @Column({ type: "text", nullable: true })
  public errorMessage?: string;
}
