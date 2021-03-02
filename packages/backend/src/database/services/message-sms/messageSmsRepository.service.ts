import { MessageSms } from "../../../_common/model/message-sms";
import { MessageSmsTable } from "../../entities/message-sms/MessageSmsTable.typeorm";
import { pgRepository } from "../_postgres";

const baseRepository = pgRepository.get<MessageSmsTable, MessageSms>(
  MessageSmsTable
);

export const messageEmailRepository = {
  ...baseRepository,
};
