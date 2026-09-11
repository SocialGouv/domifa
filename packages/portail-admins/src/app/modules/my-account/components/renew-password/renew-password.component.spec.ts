import { ComponentFixture, TestBed } from "@angular/core/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { provideHttpClient } from "@angular/common/http";
import { provideRouter } from "@angular/router";
import { StoreModule } from "@ngrx/store";
import { structuresFeature, usersFeature } from "src/app/modules/shared/store";

import { RenewPasswordComponent } from "./renew-password.component";

describe("RenewPasswordComponent", () => {
  let component: RenewPasswordComponent;
  let fixture: ComponentFixture<RenewPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RenewPasswordComponent,
        StoreModule.forRoot({
          [structuresFeature.name]: structuresFeature.reducer,
          [usersFeature.name]: usersFeature.reducer,
        }),
      ],
      providers: [provideHttpClient(), provideRouter([])],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(RenewPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
