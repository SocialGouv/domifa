import { ComponentFixture, TestBed } from "@angular/core/testing";

import { DeleteUserComponent } from "./delete-user.component";
import { APP_BASE_HREF } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { USER_SUPERVISOR_MOCK } from "../../../../mocks/USER_SUPERVISOR.mock";
import { RouterModule } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";

describe("DeleteUserComponent", () => {
  let component: DeleteUserComponent;
  let fixture: ComponentFixture<DeleteUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DeleteUserComponent],
      imports: [ReactiveFormsModule, FormsModule, RouterModule.forRoot([])],
      providers: [
        provideHttpClient(),
        { provide: APP_BASE_HREF, useValue: "/" },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteUserComponent);
    component = fixture.componentInstance;
    component.selectedUser = USER_SUPERVISOR_MOCK;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
