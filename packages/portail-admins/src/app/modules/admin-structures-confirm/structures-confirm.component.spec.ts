import { APP_BASE_HREF } from "@angular/common";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, UrlSegment } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { SharedModule } from "../shared/shared.module";
import { StructuresConfirmComponent } from "./structures-confirm.component";

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
        HttpClientTestingModule,
        RouterTestingModule,
      ],
      providers: [
        { provide: APP_BASE_HREF, useValue: "/" },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: { token: "ojopkopkpok" },
              url: [
                new UrlSegment("structures", {}),
                new UrlSegment("confirm", {}),
                new UrlSegment("1", {}),
                new UrlSegment("qzzjjdizdizjdijzijd", {}),
                new UrlSegment("1OOPKPOk", {}),
              ],
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
