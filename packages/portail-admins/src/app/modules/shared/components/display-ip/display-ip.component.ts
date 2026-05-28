import { NgIf } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { DsfrTooltipDirective } from "@edugouvfr/ngx-dsfr";

@Component({
  selector: "app-display-ip",
  imports: [NgIf, DsfrTooltipDirective],
  templateUrl: "./display-ip.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DisplayIpComponent {
  @Input() public ip: string | null | undefined;

  public get lookupUrl(): string | null {
    // AbuseIPDB: shows reputation score, recent abuse reports, ISP/ASN,
    // geolocation and whois — the most "do I trust this IP?" view for an
    // audit context. Free, no auth needed for the read-only check page.
    return this.ip
      ? `https://www.abuseipdb.com/check/${encodeURIComponent(this.ip)}`
      : null;
  }

  public get tooltip(): string {
    return this.ip
      ? `Analyser ${this.ip} sur AbuseIPDB (réputation, abuse, ISP, géolocalisation)`
      : "";
  }
}
