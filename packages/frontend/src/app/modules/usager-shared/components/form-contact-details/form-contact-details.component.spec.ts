import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormContactDetailsComponent } from "./form-contact-details.component";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { SharedModule } from "../../../shared/shared.module";
import { APP_BASE_HREF } from "@angular/common";
import { StoreModule } from "@ngrx/store";
import { _usagerReducer } from "../../../../shared";
import { NGRX_PROVIDERS_TESTING } from "../../../../shared/store/tests";
import { UsagerFormModel } from "../../interfaces";
import { USAGER_VALIDE_MOCK } from "../../../../../_common/mocks";
import { RouterModule } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";

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
        RouterModule.forRoot([]),
        StoreModule.forRoot({ app: _usagerReducer }),
      ],
      providers: [
        provideHttpClient(),
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
