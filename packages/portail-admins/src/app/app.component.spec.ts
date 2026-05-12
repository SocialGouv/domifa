import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from "@angular/core";
import { TestBed, waitForAsync } from "@angular/core/testing";
import { RouterModule } from "@angular/router";
import { AppComponent } from "./app.component";
import { provideHttpClient } from "@angular/common/http";
import { StoreModule } from "@ngrx/store";
import { structuresFeature, usersFeature } from "./modules/shared/store";

describe("AppComponent", () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [
        RouterModule.forRoot([]),
        StoreModule.forRoot({
          [structuresFeature.name]: structuresFeature.reducer,
          [usersFeature.name]: usersFeature.reducer,
        }),
      ],
      providers: [provideHttpClient()],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  it("should create the app", () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });
});
