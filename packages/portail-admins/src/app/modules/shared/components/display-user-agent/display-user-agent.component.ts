import { NgIf } from "@angular/common";
import { Clipboard } from "@angular/cdk/clipboard";
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
} from "@angular/core";
import { DsfrTooltipDirective } from "@edugouvfr/ngx-dsfr";
import { UAParser } from "ua-parser-js";

import { CustomToastService } from "../../services";

type ParsedAgent = {
  browserIcon: string;
  browser: string;
  osIcon: string;
  os: string;
  deviceIcon: string;
  deviceLabel: string;
};

// Browser / OS name (lower-cased) → Remix Icon class. DSFR's icon subset
// doesn't ship brand glyphs, but the project already depends on Remix Icons
// (see styles.scss `@import "remixicon/fonts/remixicon.css"`).
const BROWSER_ICONS: Record<string, string> = {
  chrome: "ri-chrome-fill",
  chromium: "ri-chrome-fill",
  firefox: "ri-firefox-fill",
  safari: "ri-safari-fill",
  edge: "ri-edge-new-fill",
  opera: "ri-opera-fill",
  brave: "ri-shield-fill",
  samsung: "ri-smartphone-line",
};
const OS_ICONS: Record<string, string> = {
  windows: "ri-windows-fill",
  "mac os": "ri-apple-fill",
  macos: "ri-apple-fill",
  ios: "ri-apple-fill",
  android: "ri-android-fill",
  linux: "ri-ubuntu-fill",
  ubuntu: "ri-ubuntu-fill",
  debian: "ri-ubuntu-fill",
  fedora: "ri-ubuntu-fill",
  "chrome os": "ri-chrome-fill",
};

@Component({
  selector: "app-display-user-agent",
  imports: [NgIf, DsfrTooltipDirective],
  templateUrl: "./display-user-agent.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DisplayUserAgentComponent implements OnChanges {
  @Input() public userAgent: string | null | undefined;

  public parsed: ParsedAgent | null = null;

  constructor(
    private readonly clipboard: Clipboard,
    private readonly toast: CustomToastService
  ) {}

  public ngOnChanges(): void {
    if (!this.userAgent) {
      this.parsed = null;
      return;
    }
    const ua = UAParser(this.userAgent);
    const browserName = ua.browser.name ?? "";
    const osName = ua.os.name ?? "";
    const browser = [browserName, ua.browser.version?.split(".")[0]]
      .filter(Boolean)
      .join(" ");
    const os = [osName, ua.os.version].filter(Boolean).join(" ");
    const type = ua.device.type ?? "desktop";

    this.parsed = {
      browserIcon: BROWSER_ICONS[browserName.toLowerCase()] ?? "ri-global-line",
      browser: browser || "Navigateur inconnu",
      osIcon: OS_ICONS[osName.toLowerCase()] ?? "ri-computer-line",
      os: os || "OS inconnu",
      deviceIcon:
        type === "mobile" || type === "tablet"
          ? "fr-icon-smartphone-line"
          : "fr-icon-computer-line",
      deviceLabel:
        type === "mobile"
          ? "Mobile"
          : type === "tablet"
          ? "Tablette"
          : "Ordinateur",
    };
  }

  // Public UA parsers don't expose a stable share-by-URL pattern (POST forms
  // only). The simplest, friction-free option is to copy the raw UA so the
  // admin can paste it into whatismybrowser.com, udger.com, etc.
  public copyUserAgent(): void {
    if (!this.userAgent) {
      return;
    }
    this.clipboard.copy(this.userAgent);
    this.toast.success(
      "User-Agent copié. Collez-le dans whatismybrowser.com ou udger.com pour l'analyser."
    );
  }
}
