import { ComponentFixture, TestBed } from "@angular/core/testing";

import { HomeStatsComponent } from "./home-stats.component";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CountUpModule } from "ngx-countup";
import { NgIf } from "@angular/common";
import { RouterModule } from "@angular/router";

describe("HomeStatsComponent", () => {
  let component: HomeStatsComponent;
  let fixture: ComponentFixture<HomeStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NgIf,
        HomeStatsComponent,
        CountUpModule,
        HttpClientTestingModule,
        RouterModule.forRoot([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
