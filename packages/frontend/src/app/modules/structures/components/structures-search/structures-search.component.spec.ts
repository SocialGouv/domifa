import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { APP_BASE_HREF } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { AppComponent } from "src/app/app.component";
import { NotFoundComponent } from "src/app/modules/general/components/errors/not-found/not-found.component";
import { HomeComponent } from "src/app/modules/general/components/home/home.component";
import { MentionsLegalesComponent } from "src/app/modules/general/components/mentions/mentions-legales/mentions-legales.component";
import { LoadingComponent } from "src/app/modules/loading/loading.component";
import { UsagersFormComponent } from "src/app/modules/usagers/components/form/usagers-form";
import { ManageUsagersComponent } from "src/app/modules/usagers/components/manage/manage.component";
import { UsagersProfilComponent } from "src/app/modules/usagers/components/profil/profil-component";
import { RegisterUserComponent } from "src/app/modules/users/components/register-user/register-user.component";
import { StructuresFormComponent } from "../structures-form/structures-form.component";
import { StructuresSearchComponent } from "./structures-search.component";

describe("StructuresSearchComponent", () => {
  let component: StructuresSearchComponent;
  let fixture: ComponentFixture<StructuresSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        UsagersFormComponent,
        AppComponent,
        HomeComponent,
        UsagersFormComponent,
        ManageUsagersComponent,
        UsagersProfilComponent,
        StructuresFormComponent,
        LoadingComponent,
        RegisterUserComponent,
        MentionsLegalesComponent,
        NotFoundComponent,
        StructuresSearchComponent
      ],
      imports: [
        NgbModule,
        ReactiveFormsModule,
        FormsModule,
        HttpClientModule,
        HttpClientTestingModule,
        RouterModule.forRoot([])
      ],
      providers: [{ provide: APP_BASE_HREF, useValue: "/" }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
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
