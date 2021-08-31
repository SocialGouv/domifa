import { APP_BASE_HREF } from "@angular/common";

import { HttpClientTestingModule } from "@angular/common/http/testing";
import { global } from "@angular/compiler/src/util";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { RouterTestingModule } from "@angular/router/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { MatomoModule } from "ngx-matomo";
import { StructuresModule } from "src/app/modules/structures/structures.module";
import { StatsComponent } from "./structure-stats.component";

describe("StatsComponent", () => {
  let component: StatsComponent;
  let fixture: ComponentFixture<StatsComponent>;
  const spyScrollTo = jest.fn();

  beforeEach(
    waitForAsync(() => {
      Object.defineProperty(global.window, "scroll", { value: spyScrollTo });

      TestBed.configureTestingModule({
        declarations: [StatsComponent],
        imports: [
          StructuresModule,
          HttpClientTestingModule,
          MatomoModule,
          NgbModule,
          FormsModule,
          RouterTestingModule,
        ],
        providers: [{ provide: APP_BASE_HREF, useValue: "/" }],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(StatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
