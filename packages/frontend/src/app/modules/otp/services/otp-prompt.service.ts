import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { OtpPromptOptions, OtpPromptResult } from "../otp.types";

@Injectable({ providedIn: "root" })
export class OtpPromptService {
  private readonly currentPrompt = new BehaviorSubject<OtpPromptOptions | null>(
    null
  );
  private resolver: ((result: OtpPromptResult) => void) | null = null;

  public readonly visible$: Observable<OtpPromptOptions | null> =
    this.currentPrompt.asObservable();

  public prompt(options: OtpPromptOptions): Promise<OtpPromptResult> {
    if (this.resolver) {
      this.resolver({ kind: "cancel" });
    }
    this.currentPrompt.next(options);
    return new Promise<OtpPromptResult>((resolve) => {
      this.resolver = resolve;
    });
  }

  public submit(code: string): void {
    this.close({ kind: "submit", code });
  }

  public cancel(): void {
    this.close({ kind: "cancel" });
  }

  private close(result: OtpPromptResult): void {
    const resolver = this.resolver;
    this.resolver = null;
    this.currentPrompt.next(null);
    resolver?.(result);
  }
}
