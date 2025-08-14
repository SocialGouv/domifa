import { USAGER_VALIDE_MOCK } from "../../../../../_common/mocks/USAGER_VALIDE.mock";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NO_ERRORS_SCHEMA } from "@angular/core";

import { DeleteUsagerMenuComponent } from "./delete-usager-menu.component";
import { APP_BASE_HREF } from "@angular/common";

import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { UsagerFormModel } from "../../interfaces";
import { StoreModule } from "@ngrx/store";
import { _usagerReducer } from "../../../../shared";
import { RouterModule } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";

describe("DeleteUsagerMenuComponent", () => {
  let component: DeleteUsagerMenuComponent;
  let fixture: ComponentFixture<DeleteUsagerMenuComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([]),
        NgbModule,
        StoreModule.forRoot({ app: _usagerReducer }),
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideHttpClient(),
        { provide: APP_BASE_HREF, useValue: "/" },
      ],
      declarations: [DeleteUsagerMenuComponent],
    });
    fixture = TestBed.createComponent(DeleteUsagerMenuComponent);
    component = fixture.debugElement.componentInstance;
    component.usager = new UsagerFormModel(USAGER_VALIDE_MOCK);
    component.ngOnInit();
  });

  it("can load instance", () => {
    expect(component).toBeTruthy();
  });
});
