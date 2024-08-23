import { ComponentFixture, TestBed } from "@angular/core/testing";

import { BaseUsagerNotesComponent } from "./base-usager-notes.component";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import {
  USAGER_VALIDE_MOCK,
  USER_STRUCTURE_MOCK,
} from "../../../../../_common/mocks";
import { UsagerFormModel } from "../../../usager-shared/interfaces";
import { StoreModule } from "@ngrx/store";
import { _usagerReducer } from "../../../../shared";

describe("BaseUsagerNotesComponent", () => {
  let component: BaseUsagerNotesComponent;
  let fixture: ComponentFixture<BaseUsagerNotesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BaseUsagerNotesComponent],
      imports: [
        NgbModule,
        HttpClientTestingModule,
        StoreModule.forRoot({ app: _usagerReducer }),
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(BaseUsagerNotesComponent);
    component = fixture.componentInstance;
    component.usager = new UsagerFormModel(USAGER_VALIDE_MOCK);
    component.me = USER_STRUCTURE_MOCK;

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
