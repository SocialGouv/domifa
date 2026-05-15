import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { APP_BASE_HREF } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ResetPasswordComponent } from "./reset-password.component";
import { provideRouter } from "@angular/router";
import { StoreModule } from "@ngrx/store";
import { provideHttpClient } from "@angular/common/http";
import { structuresFeature, usersFeature } from "src/app/modules/shared/store";

describe("ResetPasswordComponent", () => {
  let component: ResetPasswordComponent;
  let fixture: ComponentFixture<ResetPasswordComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ResetPasswordComponent],
      imports: [
        ReactiveFormsModule,
        FormsModule,
        StoreModule.forRoot({
          [structuresFeature.name]: structuresFeature.reducer,
          [usersFeature.name]: usersFeature.reducer,
        }),
      ],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: APP_BASE_HREF, useValue: "/" },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ResetPasswordComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  }));

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
