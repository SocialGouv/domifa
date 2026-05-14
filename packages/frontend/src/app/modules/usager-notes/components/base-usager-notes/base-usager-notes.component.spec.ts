import { ComponentFixture, TestBed } from "@angular/core/testing";

import { BaseUsagerNotesComponent } from "./base-usager-notes.component";
import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";

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
      imports: [StoreModule.forRoot({ app: _usagerReducer })],
      providers: [provideHttpClient(), provideHttpClientTesting()],
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
