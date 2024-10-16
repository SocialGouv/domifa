import { FormsModule } from "@angular/forms";
import { APP_BASE_HREF } from "@angular/common";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { UsagerFormModel } from "../../../interfaces";
import { SetInteractionInFormComponent } from "./set-interaction-in-form.component";
import { SharedModule } from "../../../../shared/shared.module";
import { USAGER_VALIDE_MOCK } from "../../../../../../_common/mocks";
import { StoreModule } from "@ngrx/store";
import { _usagerReducer } from "../../../../../shared";
import { UsagerNomCompletPipe } from "../../../pipes";

describe("SetInteractionInFormComponent", () => {
  let component: SetInteractionInFormComponent;
  let fixture: ComponentFixture<SetInteractionInFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SetInteractionInFormComponent],
      imports: [
        NgbModule,
        HttpClientTestingModule,
        SharedModule,
        FormsModule,
        UsagerNomCompletPipe,
        StoreModule.forRoot({ app: _usagerReducer }),
      ],
      providers: [{ provide: APP_BASE_HREF, useValue: "/" }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetInteractionInFormComponent);
    component = fixture.componentInstance;
    component.usager = new UsagerFormModel(USAGER_VALIDE_MOCK);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
