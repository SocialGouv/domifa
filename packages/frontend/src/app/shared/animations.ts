import {
  animate,
  animation,
  keyframes,
  style,
  transition,
  trigger,
  useAnimation,
} from "@angular/animations";

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
    animate("2s ease-in-out", style({ opacity: 0 })),
  ]),
]);

export const bounce = trigger("bounce", [
  transition(
    "* => *",
    useAnimation(
      animation(
        animate(
          "{{ timing }}s {{ delay }}s cubic-bezier(0.215, 0.610, 0.355, 1.000)",
          keyframes([
            style({ opacity: 0, transform: "scale3d(.3, .3, .3)", offset: 0 }),
            style({ transform: "scale3d(1.1, 1.1, 1.1)", offset: 0.2 }),
            style({ transform: "scale3d(.9, .9, .9)", offset: 0.4 }),
            style({
              opacity: 1,
              transform: "scale3d(1.03, 1.03, 1.03)",
              offset: 0.6,
            }),
            style({ transform: "scale3d(.97, .97, .97)", offset: 0.8 }),
            style({ opacity: 1, transform: "scale3d(1, 1, 1)", offset: 1 }),
          ])
        ),
        { params: { timing: 0.5, delay: 0 } }
      )
    )
  ),
]);
