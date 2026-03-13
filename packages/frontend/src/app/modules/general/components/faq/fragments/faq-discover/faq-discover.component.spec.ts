import { ComponentFixture, TestBed } from "@angular/core/testing";

import { FaqDiscoverComponent } from "./faq-discover.component";
import { APP_BASE_HREF } from "@angular/common";
import { provideHttpClient } from "@angular/common/http";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { MATOMO_INJECTORS } from "../../../../../../shared";

describe("FaqDiscoverComponent", () => {
  let component: FaqDiscoverComponent;
  let fixture: ComponentFixture<FaqDiscoverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FaqDiscoverComponent,
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

    fixture = TestBed.createComponent(FaqDiscoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
