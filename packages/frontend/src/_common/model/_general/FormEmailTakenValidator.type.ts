import { Observable } from "rxjs";

export type FormEmailTakenValidator = Observable<null | {
  emailTaken: boolean;
}>;
