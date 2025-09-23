import { CustomToastClass } from ".";

export type CustomToast = {
  display: boolean;
  message: string;
  class: CustomToastClass;
  dissmissable: boolean;
};
