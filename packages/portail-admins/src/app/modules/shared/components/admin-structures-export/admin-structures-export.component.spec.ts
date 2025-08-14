import { ComponentFixture, TestBed } from "@angular/core/testing";
import { RouterModule } from "@angular/router";
import { SharedModule } from "../../shared.module";
import { AdminStructuresExportComponent } from "./admin-structures-export.component";
import { provideHttpClient } from "@angular/common/http";

describe("AdminStructuresExportComponent", () => {
  let component: AdminStructuresExportComponent;
  let fixture: ComponentFixture<AdminStructuresExportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminStructuresExportComponent],
      imports: [SharedModule, RouterModule.forRoot([])],
      providers: [provideHttpClient()],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminStructuresExportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
