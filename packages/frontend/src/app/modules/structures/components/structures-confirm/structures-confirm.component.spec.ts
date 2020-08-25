import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { APP_BASE_HREF } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import {
  ActivatedRoute,
  Params,
  RouterModule,
  UrlSegment,
} from "@angular/router";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { StructuresConfirmComponent } from "./structures-confirm.component";

describe("StructuresConfirmComponent", () => {
  let component: StructuresConfirmComponent;
  let fixture: ComponentFixture<StructuresConfirmComponent>;
  let activatedRoute: ActivatedRoute;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [StructuresConfirmComponent],
      imports: [
        NgbModule,
        ReactiveFormsModule,
        FormsModule,
        HttpClientModule,
        HttpClientTestingModule,
        RouterModule.forRoot([]),
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
            },
          },
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });
    activatedRoute = TestBed.get(ActivatedRoute);
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
