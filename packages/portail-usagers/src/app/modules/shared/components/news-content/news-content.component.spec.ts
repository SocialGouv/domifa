import { ComponentFixture, TestBed } from "@angular/core/testing";

import { NewsContentComponent } from "./news-content.component";

describe("NewsContentComponent", () => {
  let component: NewsContentComponent;
  let fixture: ComponentFixture<NewsContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewsContentComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NewsContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
