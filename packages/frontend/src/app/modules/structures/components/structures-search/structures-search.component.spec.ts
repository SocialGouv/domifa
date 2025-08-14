import { APP_BASE_HREF } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { StructuresSearchComponent } from "./structures-search.component";
import { RouterModule } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";

describe("StructuresSearchComponent", () => {
  let component: StructuresSearchComponent;
  let fixture: ComponentFixture<StructuresSearchComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [StructuresSearchComponent],
      imports: [
        NgbModule,
        ReactiveFormsModule,
        FormsModule,
        RouterModule.forRoot([]),
      ],
      providers: [
        provideHttpClient(),
        { provide: APP_BASE_HREF, useValue: "/" },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StructuresSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
