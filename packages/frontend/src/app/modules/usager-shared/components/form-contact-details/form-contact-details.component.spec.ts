import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormContactDetailsComponent } from "./form-contact-details.component";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { RouterTestingModule } from "@angular/router/testing";
import { SharedModule } from "../../../shared/shared.module";
import { APP_BASE_HREF } from "@angular/common";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { StoreModule } from "@ngrx/store";
import { _usagerReducer } from "../../../../shared";
import { NGRX_PROVIDERS_TESTING } from "../../../../shared/store/tests";
import { UsagerFormModel } from "../../interfaces";
import { USAGER_VALIDE_MOCK } from "../../../../../_common/mocks";

describe("FormContactDetailsComponent", () => {
  let component: FormContactDetailsComponent;
  let fixture: ComponentFixture<FormContactDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FormContactDetailsComponent],
      imports: [
        ReactiveFormsModule,
        FormsModule,
        SharedModule,
        RouterTestingModule,
        HttpClientTestingModule,
        StoreModule.forRoot({ app: _usagerReducer }),
      ],
      providers: [
        { provide: APP_BASE_HREF, useValue: "/" },
        ...NGRX_PROVIDERS_TESTING,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FormContactDetailsComponent);
    component = fixture.componentInstance;
    component.usager = new UsagerFormModel(USAGER_VALIDE_MOCK);

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
