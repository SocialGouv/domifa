import { USAGER_ACTIF_MOCK } from "./../../../../../_common/mocks/USAGER_ACTIF.mock";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { ToastrModule } from "ngx-toastr";
import { SharedModule } from "../../../shared/shared.module";

import { DisplayUsagerDocsComponent } from "./display-usager-docs.component";
import { UsagerFormModel } from "../../interfaces";

describe("DisplayUsagerDocsComponent", () => {
  let component: DisplayUsagerDocsComponent;
  let fixture: ComponentFixture<DisplayUsagerDocsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      imports: [
        NgbModule,
        HttpClientTestingModule,
        ToastrModule.forRoot(),
        SharedModule,
      ],
      declarations: [DisplayUsagerDocsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DisplayUsagerDocsComponent);
    component = fixture.componentInstance;
    component.usager = new UsagerFormModel(USAGER_ACTIF_MOCK);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
