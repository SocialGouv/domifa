import { ComponentFixture, TestBed } from "@angular/core/testing";

import { HistoriqueCourriersComponent } from "./historique-courriers.component";
import { SharedModule } from "../../../shared/shared.module";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { NgbPagination } from "@ng-bootstrap/ng-bootstrap";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";

describe("HistoriqueCourriersComponent", () => {
  let component: HistoriqueCourriersComponent;
  let fixture: ComponentFixture<HistoriqueCourriersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HistoriqueCourriersComponent],
      imports: [
        SharedModule,
        HttpClientTestingModule,
        NgbPagination,
        FontAwesomeModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HistoriqueCourriersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
