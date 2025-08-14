import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { NewsComponent } from "./news.component";
import { SharedModule } from "../../../../shared/shared.module";
import { RouterModule } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";

describe("NewsComponent", () => {
  let component: NewsComponent;
  let fixture: ComponentFixture<NewsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [NewsComponent],
      imports: [RouterModule.forRoot([]), NgbModule, SharedModule],
      providers: [provideHttpClient()],
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
