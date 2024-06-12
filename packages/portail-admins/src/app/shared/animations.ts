import { animate, style, transition, trigger } from "@angular/animations";
export const fadeIn = trigger("fadeIn", [
  transition(":enter", [
    style({ opacity: 0 }),
    animate("0.3s ease-in", style({ opacity: 1 })),
  ]),
]);

export const fadeInOut = trigger("fadeInOut", [
  transition(":enter", [
    style({ opacity: 0 }),
    animate("0.3s ease-in", style({ opacity: 1 })),
  ]),
  transition(":leave", [
    style({ opacity: 1 }),
    animate("0.5s ease-in-out", style({ opacity: 0 })),
  ]),
]);
