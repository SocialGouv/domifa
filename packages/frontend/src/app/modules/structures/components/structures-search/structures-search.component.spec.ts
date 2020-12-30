import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { APP_BASE_HREF } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { AppComponent } from "src/app/app.component";
import { GeneralModule } from "src/app/modules/general/general.module";
import { UsagersModule } from "src/app/modules/usagers/usagers.module";
import { UsersModule } from "src/app/modules/users/users.module";
import { StructuresModule } from "../../structures.module";
import { StructuresSearchComponent } from "./structures-search.component";
import { RouterTestingModule } from "@angular/router/testing";

describe("StructuresSearchComponent", () => {
  let component: StructuresSearchComponent;
  let fixture: ComponentFixture<StructuresSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [StructuresSearchComponent],
      imports: [
        UsersModule,
        NgbModule,
        ReactiveFormsModule,
        FormsModule,
        HttpClientModule,
        HttpClientTestingModule,
        RouterTestingModule,
      ],
      providers: [{ provide: APP_BASE_HREF, useValue: "/" }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StructuresSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
