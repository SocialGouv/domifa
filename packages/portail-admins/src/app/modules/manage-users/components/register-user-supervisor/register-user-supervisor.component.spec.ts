import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { RegisterUserSupervisorComponent } from "./register-user-supervisor.component";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { APP_BASE_HREF } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { USER_SUPERVISOR_MOCK } from "../../../../mocks/USER_SUPERVISOR.mock";
import { RouterModule } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";

describe("RegisterUserSupervisorComponent", () => {
  let component: RegisterUserSupervisorComponent;
  let fixture: ComponentFixture<RegisterUserSupervisorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [RegisterUserSupervisorComponent],
      imports: [
        NgbModule,
        ReactiveFormsModule,
        FormsModule,
        RouterModule.forRoot([]),
      ],
      providers: [
        provideHttpClient(),
        { provide: APP_BASE_HREF, useValue: "/" },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterUserSupervisorComponent);
    component = fixture.componentInstance;
    component.user = USER_SUPERVISOR_MOCK;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
