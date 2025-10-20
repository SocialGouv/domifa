import { Component, Input } from "@angular/core";
import { NewsItem } from "../../types/NewsItem.type";
import { SharedModule } from "../../shared.module";
import { CommonModule } from "@angular/common";

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
