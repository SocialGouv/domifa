import { ComponentFixture, TestBed } from "@angular/core/testing";
import { PortailUsagersParamsComponent } from "./portail-usagers-params.component";
import { APP_BASE_HREF } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import {
  MockAuthService,
  USER_STRUCTURE_MOCK,
} from "../../../../../_common/mocks";
import { AuthService } from "../../../shared/services";
import { RouterModule } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";

describe("PortailUsagersParamsComponent", () => {
  let component: PortailUsagersParamsComponent;
  let fixture: ComponentFixture<PortailUsagersParamsComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        NgbModule,
        ReactiveFormsModule,
        FormsModule,
        RouterModule.forRoot([]),
      ],
      providers: [
        provideHttpClient(),
        { provide: APP_BASE_HREF, useValue: "/" },
        { provide: AuthService, useClass: MockAuthService },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],

      declarations: [PortailUsagersParamsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PortailUsagersParamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PortailUsagersParamsComponent);
    component = fixture.componentInstance;
    component.me = USER_STRUCTURE_MOCK;
    component.me.structure = USER_STRUCTURE_MOCK.structure;
    component.structure = USER_STRUCTURE_MOCK.structure;

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
