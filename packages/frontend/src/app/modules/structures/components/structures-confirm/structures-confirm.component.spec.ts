import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { APP_BASE_HREF } from "@angular/common";

import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, UrlSegment } from "@angular/router";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { StructuresConfirmComponent } from "./structures-confirm.component";
import { ToastrModule } from "ngx-toastr";
import { RouterTestingModule } from "@angular/router/testing";

describe("StructuresConfirmComponent", () => {
  let component: StructuresConfirmComponent;
  let fixture: ComponentFixture<StructuresConfirmComponent>;
  let activatedRoute: ActivatedRoute;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [StructuresConfirmComponent],
        imports: [
          NgbModule,
          ReactiveFormsModule,
          FormsModule,

          HttpClientTestingModule,
          RouterTestingModule,
          ToastrModule.forRoot(),
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
      activatedRoute = TestBed.inject(ActivatedRoute);
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(StructuresConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
