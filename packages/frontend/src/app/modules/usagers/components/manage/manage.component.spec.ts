import { APP_BASE_HREF } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { async, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { ManageUsagersComponent } from "./manage.component";

describe("ManageUsagersComponent", () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ManageUsagersComponent],
      imports: [
        NgbModule.forRoot(),
        RouterModule.forRoot([]),
        ReactiveFormsModule,
        FormsModule,
        RouterModule,
        HttpClientModule
      ],
      providers: [{ provide: APP_BASE_HREF, useValue: "/" }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  it("should create the app", () => {
    const fixture = TestBed.createComponent(ManageUsagersComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });
});
