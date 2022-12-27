import { APP_BASE_HREF } from "@angular/common";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { RouterTestingModule } from "@angular/router/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { MatomoModule } from "ngx-matomo";
import { MATOMO_INJECTOR_FOR_TESTS } from "../../../../../_common/mocks";

import { StructuresSmsFormComponent } from "./structures-sms-form.component";

describe("StructuresSmsFormComponent", () => {
  let component: StructuresSmsFormComponent;
  let fixture: ComponentFixture<StructuresSmsFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        NgbModule,
        ReactiveFormsModule,
        FormsModule,
        HttpClientTestingModule,
        MatomoModule.forRoot(MATOMO_INJECTOR_FOR_TESTS),
        RouterTestingModule,
      ],
      providers: [{ provide: APP_BASE_HREF, useValue: "/" }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [StructuresSmsFormComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StructuresSmsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
