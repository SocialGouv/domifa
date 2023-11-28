export class GlobalConstants {
  // Stockage de valeurs si LocalStorage absent
  public values: { [key: string]: string } = {};
  public storageName: "localStorage" | "sessionStorage" | "globalVariable";
  public storage: Storage | null;

  constructor() {
    if (typeof localStorage !== "undefined" && localStorage !== null) {
      this.storageName = "localStorage";
      this.storage = localStorage;
    } else if (
      typeof sessionStorage !== "undefined" &&
      sessionStorage !== null
    ) {
      this.storageName = "sessionStorage";
      this.storage = sessionStorage;
    } else {
      this.storageName = "globalVariable";
      this.storage = null;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public getItem(key: string): any | null {
    if (this.storageName !== "globalVariable" && this.storage !== null) {
      const value = this.storage.getItem(key);

      return value === null || value === undefined ? null : JSON.parse(value);
    }
    return typeof this.values[key] !== "undefined"
      ? JSON.parse(this.values[key])
      : null;
  }

  public clearStorage(): void {
    if (this.storageName !== "globalVariable" && this.storage !== null) {
      this.storage.clear();
    } else {
      this.values = {};
    }
  }

  public setItem(key: string, value: unknown): void {
    if (this.storageName !== "globalVariable" && this.storage !== null) {
      this.storage.setItem(key, JSON.stringify(value));
    } else {
      this.values[key] = JSON.stringify(value);
    }
  }

  public removeItem(key: string): void {
    if (this.storageName !== "globalVariable" && this.storage !== null) {
      this.storage.removeItem(key);
    } else {
      delete this.values[key];
    }
  }
}

export const globalConstants = new GlobalConstants();
