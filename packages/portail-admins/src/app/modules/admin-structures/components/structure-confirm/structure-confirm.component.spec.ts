import { APP_BASE_HREF } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, provideRouter } from "@angular/router";
import { provideMockStore } from "@ngrx/store/testing";
import { SharedModule } from "../../../shared/shared.module";

import { provideHttpClient } from "@angular/common/http";
import { StructureConfirmComponent } from "./structure-confirm.component";

describe("StructureConfirmComponent", () => {
  let component: StructureConfirmComponent;
  let fixture: ComponentFixture<StructureConfirmComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [StructureConfirmComponent],
      imports: [ReactiveFormsModule, FormsModule, SharedModule],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideMockStore({}),
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
    fixture = TestBed.createComponent(StructureConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
