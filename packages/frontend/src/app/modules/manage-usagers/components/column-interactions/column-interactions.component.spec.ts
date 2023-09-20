import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ColumnInteractionsComponent } from "./column-interactions.component";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { StoreModule } from "@ngrx/store";
import { _usagerReducer } from "../../../../shared";

describe("ColumnInteractionsComponent", () => {
  let component: ColumnInteractionsComponent;
  let fixture: ComponentFixture<ColumnInteractionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ColumnInteractionsComponent],
      imports: [
        NgbModule,
        HttpClientTestingModule,
        StoreModule.forRoot({ app: _usagerReducer }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ColumnInteractionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
