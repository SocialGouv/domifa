export type MessageSmsSendResponse = {
  responseCode: number;
  responseMessage: string;
  timestamp: Date;
  traceId: string;
  messageIds: string[];
};
