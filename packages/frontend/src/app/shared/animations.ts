import { animate, style, transition, trigger } from "@angular/animations";

export const fadeInOut = trigger("fadeInOut", [
  transition(":enter", [
    style({ opacity: 0 }),
    animate(300, style({ opacity: 1 }))
  ]),
  transition(":leave", [animate(150, style({ opacity: 0 }))])
]);
