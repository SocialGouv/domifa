import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { HttpClientTestingModule } from "@angular/common/http/testing";
import { RouterTestingModule } from "@angular/router/testing";

import { global } from "@angular/compiler/src/util";
import { NewsComponent } from "./news.component";

describe("NewsComponent", () => {
  let component: NewsComponent;
  let fixture: ComponentFixture<NewsComponent>;
  const spyScrollTo = jest.fn();

  beforeEach(
    waitForAsync(() => {
      Object.defineProperty(global.window, "scroll", { value: spyScrollTo });
      TestBed.configureTestingModule({
        declarations: [NewsComponent],
        imports: [HttpClientTestingModule, RouterTestingModule],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(NewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
