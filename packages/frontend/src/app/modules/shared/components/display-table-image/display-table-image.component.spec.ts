import { ComponentFixture, TestBed } from "@angular/core/testing";
import { DOMIFA_CUSTOM_DOCS } from "../../../../../_common/model";

import { DisplayTableImageComponent } from "./display-table-image.component";

describe("DisplayTableImageComponent", () => {
  let component: DisplayTableImageComponent;
  let fixture: ComponentFixture<DisplayTableImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DisplayTableImageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DisplayTableImageComponent);
    component = fixture.componentInstance;
    component.document = DOMIFA_CUSTOM_DOCS[0];
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
