import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ManageTempMessagesComponent } from "./manage-temp-messages.component";

describe("ManageTempMessagesComponent", () => {
  let component: ManageTempMessagesComponent;
  let fixture: ComponentFixture<ManageTempMessagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageTempMessagesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageTempMessagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
