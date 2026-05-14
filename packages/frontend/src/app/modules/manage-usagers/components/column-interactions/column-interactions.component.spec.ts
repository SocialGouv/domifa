import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ColumnInteractionsComponent } from "./column-interactions.component";

import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { StoreModule } from "@ngrx/store";
import { _usagerReducer } from "../../../../shared";

describe("ColumnInteractionsComponent", () => {
  let component: ColumnInteractionsComponent;
  let fixture: ComponentFixture<ColumnInteractionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ColumnInteractionsComponent,
        StoreModule.forRoot({ app: _usagerReducer }),
        ColumnInteractionsComponent,
      ],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(ColumnInteractionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
