import { Injectable } from "@angular/core";

@Injectable()
export class AuthService {
  public isAuth = false;

  public signIn() {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.isAuth = true;
        resolve(true);
      }, 2000);
    });
  }

  public signOut() {
    this.isAuth = false;
  }
}
