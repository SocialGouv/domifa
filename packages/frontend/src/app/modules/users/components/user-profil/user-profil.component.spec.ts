import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { UserProfilComponent } from "./user-profil.component";

describe("UserProfilComponent", () => {
  let component: UserProfilComponent;
  let fixture: ComponentFixture<UserProfilComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UserProfilComponent],
      imports: [RouterTestingModule, HttpClientModule, HttpClientTestingModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserProfilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
