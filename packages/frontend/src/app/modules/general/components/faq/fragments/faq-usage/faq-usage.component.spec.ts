import { ComponentFixture, TestBed } from "@angular/core/testing";

import { FaqUsageComponent } from "./faq-usage.component";
import { APP_BASE_HREF } from "@angular/common";
import { provideHttpClient } from "@angular/common/http";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { MATOMO_INJECTORS } from "../../../../../../shared";

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
