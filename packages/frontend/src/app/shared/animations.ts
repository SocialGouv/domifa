import { animate, style, transition, trigger } from "@angular/animations";

export const fadeInOut = trigger("fadeInOut", [
  transition(":enter", [
    style({ opacity: 0 }),
    animate(300, style({ opacity: 1 })),
  ]),
  transition(":leave", [animate(150, style({ opacity: 0 }))]),
]);

export const fadeInOutSlow = trigger("fadeInOutSlow", [
  transition(":enter", [
    style({ opacity: 0 }),
    animate("0.5s ease-in", style({ opacity: 1 })),
  ]),
  transition(":leave", [
    style({ opacity: 1 }),
    animate("2s ease-out", style({ opacity: 0 })),
  ]),
]);
