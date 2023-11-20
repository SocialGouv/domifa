import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { MessageSms } from "../../../_common/model/message-sms";
import { StructureTable } from "../structure";
import { AppTypeormTable } from "../_core/AppTypeormTable.typeorm";
import {
  MessageSmsId,
  MessageSmsStatus,
  MessageSmsInteractionMetas,
  MessageSmsReminderMetas,
} from "@domifa/common";

// https://typeorm.io/#/entities/column-types-for-postgres
@Entity({ name: "message_sms" })
export class MessageSmsTable
  extends AppTypeormTable<MessageSmsTable>
  implements MessageSms
{
  @Column({ type: "integer" })
  @Index()
  public usagerRef: number;

  @Index()
  @ManyToOne(() => StructureTable, (structure) => structure.id, {
    onDelete: "CASCADE",
  })
  @Column({ type: "integer", nullable: false })
  @JoinColumn({ name: "structureId", referencedColumnName: "id" })
  public structureId: number;

  @Column({ type: "text", nullable: false })
  public content: string;

  @Index()
  @Column({ type: "text", default: "TO_SEND" })
  public status: MessageSmsStatus;

  @Column({ type: "text" })
  public smsId: MessageSmsId;

  @Column({ type: "text", nullable: true })
  public responseId: string;

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

  @Column({ type: "timestamptz", nullable: true })
  public lastUpdate: Date;

  @Column({ type: "integer", default: 0 })
  public errorCount: number;

  @Column({ type: "text", nullable: true })
  public errorMessage?: string;

  @Index()
  @Column({ type: "text", nullable: false })
  public phoneNumber: string;

  @Column({ type: "text", nullable: false })
  public senderName: string;

  public constructor(entity?: Partial<MessageSmsTable>) {
    super(entity);
    Object.assign(this, entity);
  }
}
