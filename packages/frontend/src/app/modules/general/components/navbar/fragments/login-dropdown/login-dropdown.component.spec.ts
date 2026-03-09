import { ComponentFixture, TestBed } from "@angular/core/testing";

import { LoginDropdownComponent } from "./login-dropdown.component";
import { AuthService } from "../../../../../shared/services";
import { MockAuthService } from "../../../../../../../_common/mocks";
import { MATOMO_INJECTORS } from "../../../../../../shared";

describe("LoginDropdownComponent", () => {
  let component: LoginDropdownComponent;
  let fixture: ComponentFixture<LoginDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MATOMO_INJECTORS],
      declarations: [LoginDropdownComponent],
      providers: [
        {
          provide: AuthService,
          useValue: MockAuthService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
