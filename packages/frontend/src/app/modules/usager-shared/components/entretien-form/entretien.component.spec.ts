import { APP_BASE_HREF } from "@angular/common";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterTestingModule } from "@angular/router/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { ToastrModule } from "ngx-toastr";

import { SharedModule } from "../../../shared/shared.module";
import { EntretienComponent } from "./entretien.component";

describe("EntretienComponent", () => {
  let component: EntretienComponent;
  let fixture: ComponentFixture<EntretienComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [EntretienComponent],
        imports: [
          NgbModule,
          HttpClientTestingModule,
          RouterTestingModule,
          BrowserAnimationsModule,
          ToastrModule.forRoot(),
          SharedModule,
          ReactiveFormsModule,
          FormsModule,
        ],
        providers: [{ provide: APP_BASE_HREF, useValue: "/" }],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(EntretienComponent);
    component = fixture.debugElement.componentInstance;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
