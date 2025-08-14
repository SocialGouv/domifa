import { ComponentFixture, TestBed } from "@angular/core/testing";

import { HistoriqueCourriersComponent } from "./historique-courriers.component";
import { SharedModule } from "../../../shared/shared.module";
import { NgbPagination } from "@ng-bootstrap/ng-bootstrap";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import "@angular/localize/init";
import { provideHttpClient } from "@angular/common/http";
describe("HistoriqueCourriersComponent", () => {
  let component: HistoriqueCourriersComponent;
  let fixture: ComponentFixture<HistoriqueCourriersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HistoriqueCourriersComponent],
      imports: [SharedModule, NgbPagination, FontAwesomeModule],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(HistoriqueCourriersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
