import { USER_STRUCTURE_MOCK } from "./../../../../../_common/mocks/USER_STRUCTURE.mock";
import { USAGER_ACTIF_MOCK } from "./../../../../../_common/mocks/USAGER_ACTIF.mock";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NO_ERRORS_SCHEMA } from "@angular/core";

import { DeleteUsagerMenuComponent } from "./delete-usager-menu.component";
import { APP_BASE_HREF } from "@angular/common";

import { HttpClientTestingModule } from "@angular/common/http/testing";

import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { RouterTestingModule } from "@angular/router/testing";
import { UsagerFormModel } from "../../interfaces";

describe("DeleteUsagerMenuComponent", () => {
  let component: DeleteUsagerMenuComponent;
  let fixture: ComponentFixture<DeleteUsagerMenuComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, NgbModule, HttpClientTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [{ provide: APP_BASE_HREF, useValue: "/" }],
      declarations: [DeleteUsagerMenuComponent],
    });
    fixture = TestBed.createComponent(DeleteUsagerMenuComponent);
    component = fixture.debugElement.componentInstance;
    component.usager = new UsagerFormModel(USAGER_ACTIF_MOCK);
    component.me = USER_STRUCTURE_MOCK;
    component.ngOnInit();
  });

  it("can load instance", () => {
    expect(component).toBeTruthy();
  });
});
