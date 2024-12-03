import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AdminStructuresModule } from "../../admin-structures.module";
import { AdminStructuresListComponent } from "./admin-structures-list.component";
import { APP_BASE_HREF } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { RouterModule } from "@angular/router";

describe("AdminStructuresListComponent", () => {
  let component: AdminStructuresListComponent;
  let fixture: ComponentFixture<AdminStructuresListComponent>;

  beforeAll(() => {
    TestBed.configureTestingModule({
      declarations: [AdminStructuresListComponent],
      imports: [
        AdminStructuresModule,
        RouterModule.forRoot([]),
        HttpClientTestingModule,
        NoopAnimationsModule,
      ],
      providers: [{ provide: APP_BASE_HREF, useValue: "/" }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminStructuresListComponent);
    component = fixture.debugElement.componentInstance;

    component.structures = [];
    component.filteredStructures = [];
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
