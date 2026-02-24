import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import DOMIFA_NEWS from "src/assets/files/news.json";

@Injectable({ providedIn: "root" })
export class WelcomeService {
  private readonly pendingNewsSubject = new BehaviorSubject<boolean>(false);
  public pendingNews$ = this.pendingNewsSubject.asObservable();

  setPendingNews(value: boolean): void {
    this.pendingNewsSubject.next(value);
  }

  checkForNewNews(): boolean {
    const lastNews = localStorage.getItem("news");
    const latestNewsDate = new Date(DOMIFA_NEWS[0].date);

    // Vérifier que la news est du mois en cours
    if (!this.isNewsFromCurrentMonth(latestNewsDate)) {
      return false;
    }

    return lastNews ? new Date(lastNews) < latestNewsDate : true;
  }

  private isNewsFromCurrentMonth(newsDate: Date): boolean {
    const now = new Date();
    return (
      newsDate.getMonth() === now.getMonth() &&
      newsDate.getFullYear() === now.getFullYear()
    );
  }

  markNewsAsSeen(): void {
    localStorage.setItem("news", new Date(DOMIFA_NEWS[0].date).toISOString());
    this.setPendingNews(false);
  }
}
