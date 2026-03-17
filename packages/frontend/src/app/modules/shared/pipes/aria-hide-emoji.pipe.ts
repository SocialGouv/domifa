import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "ariaHideEmoji" })
export class AriaHideEmojiPipe implements PipeTransform {
  private static readonly EMOJI_REGEX =
    /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu;

  public transform(value: string): string {
    return value.replace(
      AriaHideEmojiPipe.EMOJI_REGEX,
      '<span aria-hidden="true">$1</span>'
    );
  }
}
