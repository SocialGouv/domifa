import { UserStructure } from "@domifa/common";
import { USER_STRUCTURE_MOCK } from "./USER_STRUCTURE.mock";
import { BehaviorSubject } from "rxjs";

export class MockAuthService {
  public currentUserSubject: BehaviorSubject<UserStructure | null>;

  constructor() {
    this.currentUserSubject = new BehaviorSubject<UserStructure | null>(
      USER_STRUCTURE_MOCK
    );
  }

  public get currentUserValue(): UserStructure | null {
    return this.currentUserSubject.value;
  }
}
