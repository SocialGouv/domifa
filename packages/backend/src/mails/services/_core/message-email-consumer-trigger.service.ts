import { ReplaySubject } from "rxjs";
import { MonitoringBatchProcessTrigger } from "../../../database";

const trigger$ = new ReplaySubject<MonitoringBatchProcessTrigger>(1);

export const messageEmailConsummerTrigger = {
  triggerNextSending,
  trigger$,
};

function triggerNextSending(trigger: MonitoringBatchProcessTrigger = "app") {
  trigger$.next(trigger);
}
