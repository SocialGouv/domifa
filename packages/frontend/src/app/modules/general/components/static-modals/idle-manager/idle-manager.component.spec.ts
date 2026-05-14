import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { ComponentFixture, TestBed } from "@angular/core/testing";

import { IdleManagerComponent } from "./idle-manager.component";
import { StoreModule } from "@ngrx/store";
import { _usagerReducer } from "../../../../../shared";
import { DsfrModalComponent } from "@edugouvfr/ngx-dsfr";

describe("IdleManagerComponent", () => {
  let component: IdleManagerComponent;
  let fixture: ComponentFixture<IdleManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IdleManagerComponent],
      imports: [
        DsfrModalComponent,
        StoreModule.forRoot({ app: _usagerReducer }),
      ],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IdleManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
