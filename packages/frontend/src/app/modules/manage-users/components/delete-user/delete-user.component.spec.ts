import { ComponentFixture, TestBed } from "@angular/core/testing";

import { DeleteUserComponent } from "./delete-user.component";
import { APP_BASE_HREF } from "@angular/common";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { RouterTestingModule } from "@angular/router/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { StoreModule } from "@ngrx/store";
import { _usagerReducer } from "../../../../shared";
import { USER_STRUCTURE_MOCK } from "../../../../../_common/mocks";

describe("DeleteUserComponent", () => {
  let component: DeleteUserComponent;
  let fixture: ComponentFixture<DeleteUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DeleteUserComponent],
      imports: [
        NgbModule,
        ReactiveFormsModule,
        FormsModule,
        HttpClientTestingModule,
        RouterTestingModule,
        StoreModule.forRoot({ app: _usagerReducer }),
      ],
      providers: [{ provide: APP_BASE_HREF, useValue: "/" }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteUserComponent);
    component = fixture.componentInstance;
    component.selectedUser = USER_STRUCTURE_MOCK;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
