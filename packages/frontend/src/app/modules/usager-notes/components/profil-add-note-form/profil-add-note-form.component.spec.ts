import { APP_BASE_HREF } from "@angular/common";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { USAGER_VALIDE_MOCK } from "../../../../../_common/mocks";

import { UsagerFormModel } from "../../../usager-shared/interfaces";

import { ProfilAddNoteFormComponent } from "./profil-add-note-form.component";
import { StoreModule } from "@ngrx/store";
import { _usagerReducer } from "../../../../shared";

describe("ProfilAddNoteFormComponent", () => {
  let component: ProfilAddNoteFormComponent;
  let fixture: ComponentFixture<ProfilAddNoteFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ProfilAddNoteFormComponent],
      imports: [
        NgbModule,
        HttpClientTestingModule,
        ReactiveFormsModule,
        StoreModule.forRoot({ app: _usagerReducer }),
        FormsModule,
      ],
      providers: [{ provide: APP_BASE_HREF, useValue: "/" }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfilAddNoteFormComponent);
    component = fixture.componentInstance;
    component.usager = new UsagerFormModel(USAGER_VALIDE_MOCK);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
