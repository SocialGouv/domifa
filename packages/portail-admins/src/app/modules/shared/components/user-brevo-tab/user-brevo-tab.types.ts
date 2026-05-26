import { Observable } from "rxjs";

import {
  ApiMessage,
  BrevoContactStatus,
  BrevoEmailEvent,
  BrevoEmailEventType,
} from "@domifa/common";

export type BrevoStatusFetcher = (
  uuid: string
) => Observable<BrevoContactStatus>;

export type BrevoEventsFetcherOptions = {
  limit: number;
  offset: number;
  event?: BrevoEmailEventType;
  days?: number;
};

export type BrevoEventsFetcher = (
  uuid: string,
  options: BrevoEventsFetcherOptions
) => Observable<BrevoEmailEvent[]>;

export type BrevoUnblockFetcher = (uuid: string) => Observable<ApiMessage>;
