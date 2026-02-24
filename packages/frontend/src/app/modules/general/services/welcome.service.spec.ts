import { TestBed } from "@angular/core/testing";
import { WelcomeService } from "./welcome.service";

describe("WelcomeService", () => {
  let service: WelcomeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WelcomeService);
    localStorage.clear();
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should emit pendingNews updates", (done) => {
    service.pendingNews$.subscribe((value) => {
      expect(value).toBe(true);
      done();
    });
    service.setPendingNews(true);
  });

  it("should mark news as seen in localStorage", () => {
    service.markNewsAsSeen();
    const newsDate = localStorage.getItem("news");
    expect(newsDate).toBeTruthy();
  });
});
