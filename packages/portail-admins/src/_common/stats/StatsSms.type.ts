export type StatsSms = [
  {
    name: string;
    series: [
      {
        name: string;
        value: string;
      }
    ];
  }?
];

export type SmdId =
  | "courrierIn"
  | "colisIn"
  | "echeanceDeuxMois"
  | "recommandeIn";

export type GlobalType = "sms" | "structure";
