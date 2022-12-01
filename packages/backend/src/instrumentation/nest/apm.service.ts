import { Injectable } from "@nestjs/common";
import apm from "elastic-apm-node";

@Injectable()
export class ApmService {
  captureError(data: any): void {
    apm.captureError(data);
  }

  startTransaction(
    name?: string,
    options?: apm.TransactionOptions
  ): apm.Transaction | null {
    return apm.startTransaction(name, options);
  }

  setTransactionName(name: string): void {
    apm.setTransactionName(name);
  }

  startSpan(name?: string, options?: apm.SpanOptions): apm.Span | null {
    return apm.startSpan(name, options);
  }

  setCustomContext(context: Record<string, unknown>): void {
    apm.setCustomContext(context);
  }
}
