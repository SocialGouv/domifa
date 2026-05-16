import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { NewsComponent } from "./news.component";
import { provideRouter } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";

describe("NewsComponent", () => {
  let component: NewsComponent;
  let fixture: ComponentFixture<NewsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [NewsComponent],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
