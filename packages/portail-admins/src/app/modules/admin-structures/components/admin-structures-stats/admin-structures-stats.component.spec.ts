import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { AdminStructuresModule } from "../../admin-structures.module";
import { AdminStructuresStatsComponent } from "./admin-structures-stats.component";

describe("AdminStructuresStatsComponent", () => {
  let component: AdminStructuresStatsComponent;
  let fixture: ComponentFixture<AdminStructuresStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminStructuresStatsComponent],
      imports: [
        AdminStructuresModule,
        RouterTestingModule,

        HttpClientTestingModule,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminStructuresStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
