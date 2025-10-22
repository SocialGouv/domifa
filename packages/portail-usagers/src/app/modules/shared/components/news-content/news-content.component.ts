import { Component, Input } from "@angular/core";
import { SharedModule } from "../../shared.module";
import { CommonModule } from "@angular/common";
import { NewsItem } from "@domifa/common";

@Component({
  selector: "app-news-content",
  standalone: true,
  imports: [SharedModule, CommonModule],
  templateUrl: "./news-content.component.html",
})
export class NewsContentComponent {
  @Input() public isModal = false;
  @Input() public news: NewsItem[] = [];
}
