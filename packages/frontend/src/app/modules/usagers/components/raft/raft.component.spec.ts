import { FormsModule } from "@angular/forms";
import { SharedModule } from "src/app/modules/shared/shared.module";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { APP_BASE_HREF } from "@angular/common";

import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { RaftComponent } from "./raft.component";

import { RouterTestingModule } from "@angular/router/testing";
import { ToastrModule } from "ngx-toastr";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

describe("RaftComponent", () => {
  let component: RaftComponent;
  let fixture: ComponentFixture<RaftComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [RaftComponent],
        imports: [
          NgbModule,
          HttpClientTestingModule,
          RouterTestingModule,
          BrowserAnimationsModule,
          ToastrModule.forRoot(),
          SharedModule,
          FormsModule,
        ],
        providers: [{ provide: APP_BASE_HREF, useValue: "/" }],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(RaftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
