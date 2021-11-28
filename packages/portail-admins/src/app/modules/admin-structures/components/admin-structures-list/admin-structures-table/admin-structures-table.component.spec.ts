import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { ToastrModule } from "ngx-toastr";
import { AdminStructuresModule } from "../../../admin-structures.module";
import { AdminStructuresTableComponent } from "./admin-structures-table.component";

describe("AdminStructuresTableComponent", () => {
  let component: AdminStructuresTableComponent;
  let fixture: ComponentFixture<AdminStructuresTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminStructuresTableComponent],
      imports: [
        AdminStructuresModule,
        RouterTestingModule,
        ToastrModule.forRoot(),
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
