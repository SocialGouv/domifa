import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AdminStructuresTableComponent } from "./admin-structures-table.component";
import { AdminStructuresModule } from "../../admin-structures.module";
import { RouterModule } from "@angular/router";

describe("AdminStructuresTableComponent", () => {
  let component: AdminStructuresTableComponent;
  let fixture: ComponentFixture<AdminStructuresTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminStructuresTableComponent],
      imports: [
        AdminStructuresModule,
        RouterModule.forRoot([]),
        HttpClientTestingModule,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminStructuresTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
