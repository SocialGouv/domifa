import { Column, Entity, Index } from "typeorm";
import {
  MessageSms,
  MessageSmsId,
  MessageSmsInteractionMetas,
  MessageSmsReminderMetas,
  MessageSmsStatus,
  MessageSmsUpdate,
} from "../../../_common/model/message-sms";
import { AppTypeormTable } from "../_core/AppTypeormTable.typeorm";

// https://typeorm.io/#/entities/column-types-for-postgres
@Entity({ name: "message_sms" })
export class MessageSmsTable
  extends AppTypeormTable<MessageSmsTable>
  implements MessageSms
{
  // Infos usager
  @Column({ type: "integer" })
  @Index()
  public usagerRef: number;

  @Column({ type: "integer" })
  @Index()
  public structureId: number;

  // Contenu du message
  @Column({ type: "text" })
  public content: string;

  @Column({ type: "text", default: "TO_SEND" })
  @Index()
  public status: MessageSmsStatus;

  @Column({ type: "text" })
  public smsId: MessageSmsId;

  @Column({ type: "text", nullable: true })
  public responseId: string;

  // DATE D'ENVOI PRÉVUE
  @Column({ type: "timestamptz" })
  public scheduledDate: Date;

  // DATE D'ENVOI EFFECTIF
  @Column({ type: "timestamptz", nullable: true })
  public sendDate: Date;

  // Metas selon le contexte
  @Column({ type: "jsonb", nullable: true })
  public interactionMetas: MessageSmsInteractionMetas;

  @Column({ type: "jsonb", nullable: true })
  public reminderMetas: MessageSmsReminderMetas;

  @Column({ type: "jsonb", nullable: true })
  public statusUpdates: MessageSmsUpdate[];

  @Column({ type: "timestamptz", nullable: true })
  public lastUpdate: Date;

  @Column({ type: "integer", default: 0 })
  public errorCount: number;

  @Column({ type: "text", nullable: true })
  public errorMessage?: string;

  @Column({ type: "text" })
  public phoneNumber: string;

  @Column({ type: "text" })
  public senderName: string;

  public constructor(entity?: Partial<MessageSmsTable>) {
    super(entity);
    Object.assign(this, entity);
  }
}
