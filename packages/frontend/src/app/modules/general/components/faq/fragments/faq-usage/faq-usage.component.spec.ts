import { ComponentFixture, TestBed } from "@angular/core/testing";

import { FaqUsageComponent } from "./faq-usage.component";

describe("FaqUsageComponent", () => {
  let component: FaqUsageComponent;
  let fixture: ComponentFixture<FaqUsageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FaqUsageComponent,
        NgbModule,
        ReactiveFormsModule,
        FormsModule,
        RouterModule.forRoot([]),
        ...MATOMO_INJECTORS,
      ],
      providers: [
        provideHttpClient(),
        { provide: APP_BASE_HREF, useValue: "/" },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FaqUsageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
