import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { AdminStructuresModule } from "../../admin-structures.module";
import { AdminStructuresListComponent } from "./admin-structures-list.component";

describe("AdminStructuresListComponent", () => {
  let component: AdminStructuresListComponent;
  let fixture: ComponentFixture<AdminStructuresListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminStructuresListComponent],
      imports: [
        AdminStructuresModule,
        RouterTestingModule,
        HttpClientTestingModule,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminStructuresListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
