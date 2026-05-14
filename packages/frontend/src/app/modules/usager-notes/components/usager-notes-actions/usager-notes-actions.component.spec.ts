import { ComponentFixture, TestBed } from "@angular/core/testing";

import { UsagerNotesActionsComponent } from "./usager-notes-actions.component";
import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";

import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { USAGER_VALIDE_MOCK, USAGER_NOTE } from "../../../../../_common/mocks";
import { UsagerFormModel } from "../../../usager-shared/interfaces";
import { StoreModule } from "@ngrx/store";
import { _usagerReducer } from "../../../../shared";

describe("UsagerNotesActionsComponent", () => {
  let component: UsagerNotesActionsComponent;
  let fixture: ComponentFixture<UsagerNotesActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreModule.forRoot({ app: _usagerReducer })],
      providers: [provideHttpClient(), provideHttpClientTesting()],
      declarations: [UsagerNotesActionsComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(UsagerNotesActionsComponent);

    component = fixture.componentInstance;
    component.usager = new UsagerFormModel(USAGER_VALIDE_MOCK);
    component.note = USAGER_NOTE;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
