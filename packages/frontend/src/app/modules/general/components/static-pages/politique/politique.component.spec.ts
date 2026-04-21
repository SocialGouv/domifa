import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { MATOMO_INJECTORS } from "../../../../../shared";
import { PolitiqueComponent } from "./politique.component";
import { ComponentFixture, TestBed } from "@angular/core/testing";

describe("PolitiqueComponent", () => {
  let component: PolitiqueComponent;
  let fixture: ComponentFixture<PolitiqueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolitiqueComponent, ...MATOMO_INJECTORS],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PolitiqueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
