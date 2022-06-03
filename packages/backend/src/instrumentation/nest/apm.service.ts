import { Injectable } from '@nestjs/common';
import * as APM from 'elastic-apm-node';
import apm = require('elastic-apm-node');

@Injectable()
export class ApmService {
  private readonly apm: apm.Agent;

  constructor() {
    this.apm = APM;
  }

  captureError(data: any): void {
    this.apm.captureError(data);
  }

  startTransaction(
    name?: string,
    options?: apm.TransactionOptions
  ): apm.Transaction | null {
    return this.apm.startTransaction(name, options);
  }

  setTransactionName(name: string): void {
    this.apm.setTransactionName(name);
  }

  startSpan(name?: string, options?: apm.SpanOptions): apm.Span | null {
    return this.apm.startSpan(name, options);
  }

  setCustomContext(context: Record<string, unknown>): void {
    this.apm.setCustomContext(context);
  }
}
