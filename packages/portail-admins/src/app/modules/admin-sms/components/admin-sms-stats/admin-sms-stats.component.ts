import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";

import { PortailAdminProfile } from "../../../../../_common";
import { AdminAuthService } from "../../../admin-auth/services/admin-auth.service";
import { AdminSmsApiClient } from "../../../shared/services/api/admin-sms-api-client.service";

@Component({
  selector: "app-admin-sms-stats",
  templateUrl: "./admin-sms-stats.component.html",
  styleUrls: ["./admin-sms-stats.component.css"],
})
export class AdminSmsStatsComponent implements OnInit, OnDestroy {
  public adminProfile!: PortailAdminProfile | null;

  private subscription = new Subscription();

  public globalSms: any[];
  public globalStructureSms: any[];
  public courrierIn30: any[];
  public courrierIn12: any[];
  public colisIn30: any[];
  public colisIn12: any[];
  public recommandeIn30: any[];
  public recommandeIn12: any[];
  public echeanceDeuxMois30: any[];
  public echeanceDeuxMois12: any[];

  constructor(
    private readonly adminAuthService: AdminAuthService,
    private readonly adminSmsApiClient: AdminSmsApiClient
  ) {
    this.adminProfile = null;
    this.globalSms = [];
    this.globalStructureSms = [];
    this.courrierIn30 = [];
    this.courrierIn12 = [];
    this.colisIn30 = [];
    this.colisIn12 = [];
    this.recommandeIn30 = [];
    this.recommandeIn12 = [];
    this.echeanceDeuxMois30 = [];
    this.echeanceDeuxMois12 = [];
  }

  public ngOnInit(): void {
    this.subscription.add(
      this.adminAuthService.currentAdminSubject.subscribe(
        (apiResponse: PortailAdminProfile | null) => {
          this.adminProfile = apiResponse;
        }
      )
    );

    // Global stats
    this.subscription.add(
      this.adminSmsApiClient.getStatsGlobal("sms").subscribe((data) => {
        this.globalSms = [{ name: "SMS", series: data }];
      })
    );
    this.subscription.add(
      this.adminSmsApiClient.getStatsGlobal("structure").subscribe((data) => {
        this.globalStructureSms = [{ name: "Structures", series: data }];
      })
    );

    // courrierIn
    this.subscription.add(
      this.adminSmsApiClient
        .getStats("courrierIn", "days")
        .subscribe((data) => {
          this.courrierIn30 = [{ name: "SMS", series: data }];
        })
    );
    this.subscription.add(
      this.adminSmsApiClient
        .getStats("courrierIn", "months")
        .subscribe((data) => {
          this.courrierIn12 = [{ name: "SMS", series: data }];
        })
    );

    // colisIn
    this.subscription.add(
      this.adminSmsApiClient.getStats("colisIn", "days").subscribe((data) => {
        this.colisIn30 = [{ name: "SMS", series: data }];
      })
    );
    this.subscription.add(
      this.adminSmsApiClient.getStats("colisIn", "months").subscribe((data) => {
        this.colisIn12 = [{ name: "SMS", series: data }];
      })
    );

    // recommandeIn
    this.subscription.add(
      this.adminSmsApiClient
        .getStats("recommandeIn", "days")
        .subscribe((data) => {
          this.recommandeIn30 = [{ name: "SMS", series: data }];
        })
    );
    this.subscription.add(
      this.adminSmsApiClient
        .getStats("recommandeIn", "months")
        .subscribe((data) => {
          this.recommandeIn12 = [{ name: "SMS", series: data }];
        })
    );

    // echeanceDeuxMois
    this.subscription.add(
      this.adminSmsApiClient
        .getStats("echeanceDeuxMois", "days")
        .subscribe((data) => {
          this.echeanceDeuxMois30 = [{ name: "SMS", series: data }];
        })
    );
    this.subscription.add(
      this.adminSmsApiClient
        .getStats("echeanceDeuxMois", "months")
        .subscribe((data) => {
          this.echeanceDeuxMois12 = [{ name: "SMS", series: data }];
        })
    );
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
