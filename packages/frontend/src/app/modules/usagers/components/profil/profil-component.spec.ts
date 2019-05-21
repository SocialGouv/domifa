import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UsagersProfilComponent } from './profil-component';

describe('UsagersProfilComponent', () => {
    let component: UsagersProfilComponent;
    let fixture: ComponentFixture<UsagersProfilComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [UsagersProfilComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(UsagersProfilComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
});
