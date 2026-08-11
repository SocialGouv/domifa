import { ComponentFixture, TestBed } from "@angular/core/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { provideHttpClient } from "@angular/common/http";
import { provideRouter } from "@angular/router";
import { StoreModule } from "@ngrx/store";
import { structuresFeature, usersFeature } from "src/app/modules/shared/store";

import { MyAccountComponent } from "./my-account.component";

describe("MyAccountComponent", () => {
  let component: MyAccountComponent;
  let fixture: ComponentFixture<MyAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MyAccountComponent,
        StoreModule.forRoot({
          [structuresFeature.name]: structuresFeature.reducer,
          [usersFeature.name]: usersFeature.reducer,
        }),
      ],
      providers: [provideHttpClient(), provideRouter([])],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(MyAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should open the password form", () => {
    expect(component.editPassword).toBe(false);
    component.openPasswordForm();
    expect(component.editPassword).toBe(true);
  });

  it("should close the password form on cancel", () => {
    component.openPasswordForm();
    component.onPasswordCancel();
    expect(component.editPassword).toBe(false);
  });
});
