import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { AppTourModalComponent } from "./app-tour-modal.component";
import { CommonModule, APP_BASE_HREF } from "@angular/common";
import { provideHttpClient } from "@angular/common/http";
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from "@angular/core";
import { RouterModule } from "@angular/router";
import { _usagerReducer, MATOMO_INJECTORS } from "../../../../../shared";
import { SharedModule } from "../../../../shared/shared.module";
import { StoreModule } from "@ngrx/store";

describe("AppTourModalComponent", () => {
  let component: AppTourModalComponent;
  let fixture: ComponentFixture<AppTourModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [],
      imports: [
        CommonModule,
        SharedModule,
        RouterModule.forRoot([]),
        StoreModule.forRoot({ app: _usagerReducer }),
        ...MATOMO_INJECTORS,
        NgbModule,
      ],
      providers: [
        provideHttpClient(),
        { provide: APP_BASE_HREF, useValue: "/" },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AppTourModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should navigate to next step", () => {
    expect(component.currentStep).toBe(0);
    component.nextStep();
    expect(component.currentStep).toBe(1);
  });

  it("should navigate to previous step", () => {
    component.currentStep = 1;
    component.previousStep();
    expect(component.currentStep).toBe(0);
  });
});
