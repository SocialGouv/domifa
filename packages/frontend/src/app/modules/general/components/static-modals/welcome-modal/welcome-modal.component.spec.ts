import { ComponentFixture, TestBed } from "@angular/core/testing";
import { WelcomeModalComponent } from "./welcome-modal.component";
import { CommonModule, APP_BASE_HREF } from "@angular/common";
import { provideHttpClient } from "@angular/common/http";
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from "@angular/core";
import { RouterModule } from "@angular/router";
import { StoreModule } from "@ngrx/store";
import { MATOMO_INJECTORS, _usagerReducer } from "../../../../../shared";
import { SharedModule } from "../../../../shared/shared.module";

describe("WelcomeModalComponent", () => {
  let component: WelcomeModalComponent;
  let fixture: ComponentFixture<WelcomeModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        SharedModule,
        RouterModule.forRoot([]),
        MATOMO_INJECTORS,
        StoreModule.forRoot({ app: _usagerReducer }),
      ],
      providers: [
        provideHttpClient(),
        { provide: APP_BASE_HREF, useValue: "/" },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(WelcomeModalComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
