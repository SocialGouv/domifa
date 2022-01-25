import { StatsSmsChartsDatas } from "./../../../../../_common/stats/StatsSmsChartsDatas.type";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";

import { PortailAdminProfile, StatsSmsApiDatas } from "../../../../../_common";
import { AdminAuthService } from "../../../admin-auth/services/admin-auth.service";
import { AdminSmsApiClient } from "../../admin-sms-api-client.service";

@Component({
  selector: "app-admin-sms-stats",
  templateUrl: "./admin-sms-stats.component.html",
  styleUrls: ["./admin-sms-stats.component.css"],
})
export class AdminSmsStatsComponent implements OnInit, OnDestroy {
  public adminProfile!: PortailAdminProfile | null;

  public view: number[] = [700, 400];

  public gradient = false;

  // options for the chart
  public showXAxis = true;
  public showYAxis = true;
  public yLabel = "Nombre de SMS envoyés";

  public showLegend = false;
  public barPadding = 50;

  public showYAxisLabel = true;
  public showXAxisLabel = true;

  public showLabels = true;

  private subscription = new Subscription();

  public globalSms: StatsSmsChartsDatas;
  public courrierIn30: StatsSmsChartsDatas;
  public courrierIn12: StatsSmsChartsDatas;
  public colisIn30: StatsSmsChartsDatas;
  public colisIn12: StatsSmsChartsDatas;
  public recommandeIn30: StatsSmsChartsDatas;
  public recommandeIn12: StatsSmsChartsDatas;
  public echeanceDeuxMois30: StatsSmsChartsDatas;
  public echeanceDeuxMois12: StatsSmsChartsDatas;

  constructor(
    private readonly adminAuthService: AdminAuthService,
    private readonly adminSmsApiClient: AdminSmsApiClient
  ) {
    this.adminProfile = null;
    this.globalSms = [];
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
      this.adminSmsApiClient
        .getStatsGlobal()
        .subscribe((data: StatsSmsApiDatas) => {
          this.globalSms = [{ name: "SMS", series: data }];
        })
    );

    // courrierIn
    this.subscription.add(
      this.adminSmsApiClient
        .getStats("courrierIn", "days")
        .subscribe((data: StatsSmsApiDatas) => {
          this.courrierIn30 = [{ name: "SMS", series: data }];
        })
    );
    this.subscription.add(
      this.adminSmsApiClient
        .getStats("courrierIn", "months")
        .subscribe((data: StatsSmsApiDatas) => {
          this.courrierIn12 = [{ name: "SMS", series: data }];
        })
    );

    // colisIn
    this.subscription.add(
      this.adminSmsApiClient
        .getStats("colisIn", "days")
        .subscribe((data: StatsSmsApiDatas) => {
          this.colisIn30 = [{ name: "SMS", series: data }];
        })
    );

    this.subscription.add(
      this.adminSmsApiClient
        .getStats("colisIn", "months")
        .subscribe((data: StatsSmsApiDatas) => {
          this.colisIn12 = [{ name: "SMS", series: data }];
        })
    );

    // recommandeIn
    this.subscription.add(
      this.adminSmsApiClient
        .getStats("recommandeIn", "days")
        .subscribe((data: StatsSmsApiDatas) => {
          this.recommandeIn30 = [{ name: "SMS", series: data }];
        })
    );
    this.subscription.add(
      this.adminSmsApiClient
        .getStats("recommandeIn", "months")
        .subscribe((data: StatsSmsApiDatas) => {
          this.recommandeIn12 = [{ name: "SMS", series: data }];
        })
    );

    // echeanceDeuxMois
    this.subscription.add(
      this.adminSmsApiClient
        .getStats("echeanceDeuxMois", "days")
        .subscribe((data: StatsSmsApiDatas) => {
          this.echeanceDeuxMois30 = [{ name: "SMS", series: data }];
        })
    );
    this.subscription.add(
      this.adminSmsApiClient
        .getStats("echeanceDeuxMois", "months")
        .subscribe((data: StatsSmsApiDatas) => {
          this.echeanceDeuxMois12 = [{ name: "SMS", series: data }];
        })
    );
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
