import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { SharedModule } from "./../../../shared/shared.module";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { HttpClientTestingModule } from "@angular/common/http/testing";
import { RouterTestingModule } from "@angular/router/testing";

import { NewsComponent } from "./news.component";

describe("NewsComponent", () => {
  let component: NewsComponent;
  let fixture: ComponentFixture<NewsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [NewsComponent],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        SharedModule,
        NgbModule,
      ],
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
