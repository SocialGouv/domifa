import { APP_BASE_HREF } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";

import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { USAGER_VALIDE_MOCK } from "../../../../../_common/mocks/USAGER_VALIDE.mock";
import { SharedModule } from "../../../shared/shared.module";
import { UsagerFormModel } from "../../interfaces";

import { UploadComponent } from "./upload.component";
import { RouterModule } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";

describe("UploadComponent", () => {
  let component: UploadComponent;
  let fixture: ComponentFixture<UploadComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [UploadComponent],
      imports: [
        NgbModule,
        RouterModule.forRoot([]),
        SharedModule,
        ReactiveFormsModule,
        FormsModule,
      ],
      providers: [
        provideHttpClient(),
        { provide: APP_BASE_HREF, useValue: "/" },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadComponent);
    component = fixture.componentInstance;

    component.usager = new UsagerFormModel(USAGER_VALIDE_MOCK);
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
