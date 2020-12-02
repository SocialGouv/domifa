import { MessageEmail, MessageEmailTable } from "../../entities/message-email";
import { pgRepository } from "../_postgres";

const baseRepository = pgRepository.get<MessageEmailTable, MessageEmail>(
  MessageEmailTable
);

export const messageEmailRepository = {
  ...baseRepository,
};
