import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { IdleManagerComponent } from "./idle-manager.component";
import { provideHttpClient } from "@angular/common/http";

describe("IdleManagerComponent", () => {
  let component: IdleManagerComponent;
  let fixture: ComponentFixture<IdleManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IdleManagerComponent],
      imports: [NgbModule],
      providers: [provideHttpClient()],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IdleManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
