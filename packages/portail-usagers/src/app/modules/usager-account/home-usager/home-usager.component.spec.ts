import { ComponentFixture, TestBed } from "@angular/core/testing";
import { UsagerAccountModule } from "../usager-account.module";
import { HomeUsagerComponent } from "./home-usager.component";

describe("HomeUsagerComponent", () => {
  let component: HomeUsagerComponent;
  let fixture: ComponentFixture<HomeUsagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HomeUsagerComponent],
      imports: [UsagerAccountModule],
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
