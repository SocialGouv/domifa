import { APP_BASE_HREF } from "@angular/common";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ComponentFixture, waitForAsync, TestBed } from "@angular/core/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { USAGER_VALIDE_MOCK } from "../../../../../../_common/mocks/USAGER_VALIDE.mock";
import { UsagerFormModel } from "../../../interfaces";

import { SetInteractionOutFormComponent } from "./set-interaction-out-form.component";
import { FormsModule } from "@angular/forms";
import { StoreModule } from "@ngrx/store";
import { _usagerReducer } from "../../../../../shared";
import { FullNamePipe } from "../../../pipes";
import { SharedModule } from "../../../../shared/shared.module";

describe("SetInteractionOutFormComponent", () => {
  let component: SetInteractionOutFormComponent;
  let fixture: ComponentFixture<SetInteractionOutFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SetInteractionOutFormComponent],
      imports: [
        NgbModule,
        HttpClientTestingModule,
        FormsModule,
        SharedModule,
        FullNamePipe,
        StoreModule.forRoot({ app: _usagerReducer }),
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [{ provide: APP_BASE_HREF, useValue: "/" }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetInteractionOutFormComponent);
    component = fixture.componentInstance;
    component.usager = new UsagerFormModel(USAGER_VALIDE_MOCK);

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
