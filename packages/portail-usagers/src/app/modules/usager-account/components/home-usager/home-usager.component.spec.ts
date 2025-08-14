import { provideHttpClientTesting } from "@angular/common/http/testing";
import { ComponentFixture, TestBed } from "@angular/core/testing";

import { HomeUsagerComponent } from "./home-usager.component";
import { UsagerAccountModule } from "../../usager-account.module";
import { RouterModule } from "@angular/router";

describe("HomeUsagerComponent", () => {
  let component: HomeUsagerComponent;
  let fixture: ComponentFixture<HomeUsagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HomeUsagerComponent],
      imports: [UsagerAccountModule, RouterModule.forRoot([])],
      providers: [provideHttpClientTesting()],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeUsagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
