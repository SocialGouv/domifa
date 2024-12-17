import { ComponentFixture, TestBed } from "@angular/core/testing";

import { UsersComponent } from "./users.component";
import { CommonModule } from "@angular/common";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { RouterModule } from "@angular/router";
import { TableHeadSortComponent } from "../../../shared/components/table-head-sort/table-head-sort.component";
import { SortArrayPipe } from "../../../shared/pipes/sort-array.pipe";
import { AdminStructuresApiClient } from "../../../shared/services";

describe("UsersComponent", () => {
  let component: UsersComponent;
  let fixture: ComponentFixture<UsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UsersComponent],
      imports: [
        CommonModule,
        TableHeadSortComponent,
        SortArrayPipe,
        HttpClientTestingModule,
        RouterModule.forRoot([]),
      ],
      providers: [AdminStructuresApiClient],
    }).compileComponents();

    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
