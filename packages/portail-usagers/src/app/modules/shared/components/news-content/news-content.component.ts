import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NewsItem } from "@domifa/common";
import { ReplaceLineBreaks } from "../../pipes/nl2br.pipe";

@Component({
  selector: "app-news-content",
  imports: [CommonModule, ReplaceLineBreaks],
  templateUrl: "./news-content.component.html",
})
export class NewsContentComponent {
  @Input() public isModal = false;
  @Input() public news: NewsItem[] = [];
}
