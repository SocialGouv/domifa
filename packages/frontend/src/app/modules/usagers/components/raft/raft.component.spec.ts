import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { RaftComponent } from "./raft.component";

describe("RaftComponent", () => {
  let component: RaftComponent;
  let fixture: ComponentFixture<RaftComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RaftComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RaftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
