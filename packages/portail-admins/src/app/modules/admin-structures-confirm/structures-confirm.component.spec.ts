import { APP_BASE_HREF } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { RouterModule } from "@angular/router";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { SharedModule } from "../shared/shared.module";
import { StructuresConfirmComponent } from "./structures-confirm.component";
import { provideHttpClient } from "@angular/common/http";

describe("StructuresConfirmComponent", () => {
  let component: StructuresConfirmComponent;
  let fixture: ComponentFixture<StructuresConfirmComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [StructuresConfirmComponent],
      imports: [
        NgbModule,
        ReactiveFormsModule,
        FormsModule,
        SharedModule,
        RouterModule.forRoot([]),
      ],
      providers: [
        provideHttpClient(),
        { provide: APP_BASE_HREF, useValue: "/" },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: {
                structureUuid: "ee7ef219-b101-422c-8ad4-4d5aedf9caad",
                token: "5d8b20a1e1f11",
              },
              data: {
                type: "enable",
              },
            },
          },
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StructuresConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
