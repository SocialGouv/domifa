import { ComponentFixture, TestBed } from "@angular/core/testing";

import { LoginModalMenuComponent } from "./login-modal-menu.component";
import { AuthService } from "../../../../../shared/services";
import { MockAuthService } from "../../../../../../../_common/mocks";

describe("LoginModalMenuComponent", () => {
  let component: LoginModalMenuComponent;
  let fixture: ComponentFixture<LoginModalMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoginModalMenuComponent],
      providers: [
        {
          provide: AuthService,
          useValue: MockAuthService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginModalMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
