import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { HttpClient, HttpClientModule } from "@angular/common/http";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { StructuresFormComponent } from "./structures-form.component";

describe("StructuresFormComponent", () => {
  let component: StructuresFormComponent;
  let fixture: ComponentFixture<StructuresFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [StructuresFormComponent],
      imports: [NgbModule, ReactiveFormsModule, FormsModule, HttpClientModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StructuresFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
