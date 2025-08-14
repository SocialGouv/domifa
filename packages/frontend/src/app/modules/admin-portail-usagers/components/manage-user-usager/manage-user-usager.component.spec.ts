import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ManageUserUsagerComponent } from "./manage-user-usager.component";
import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { SharedModule } from "../../../shared/shared.module";
import { StoreModule } from "@ngrx/store";
import { _usagerReducer } from "../../../../shared";
import { CommonModule } from "@angular/common";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

describe("ManageUserUsagerComponent", () => {
  let component: ManageUserUsagerComponent;
  let fixture: ComponentFixture<ManageUserUsagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageUserUsagerComponent],
      imports: [
        SharedModule,
        CommonModule,
        NoopAnimationsModule,
        NgbModule,
        StoreModule.forRoot({ app: _usagerReducer }),
      ],
      providers: [provideHttpClient(), provideHttpClientTesting()],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageUserUsagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
