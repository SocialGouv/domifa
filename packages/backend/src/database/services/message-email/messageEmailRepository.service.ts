import { myDataSource } from "..";
import { MessageEmail, MessageEmailTable } from "../../entities/message-email";

export const messageEmailRepository =
  myDataSource.getRepository<MessageEmail>(MessageEmailTable);
