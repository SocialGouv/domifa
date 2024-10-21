import { HttpClientTestingModule } from "@angular/common/http/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { ComponentFixture, TestBed } from "@angular/core/testing";

import { HomeUsagerComponent } from "./home-usager.component";
import { UsagerAccountModule } from "../../usager-account.module";

describe("HomeUsagerComponent", () => {
  let component: HomeUsagerComponent;
  let fixture: ComponentFixture<HomeUsagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HomeUsagerComponent],
      imports: [
        UsagerAccountModule,
        RouterTestingModule,
        HttpClientTestingModule,
      ],
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
