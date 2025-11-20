import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Registerusers } from './registerusers';

describe('Registerusers', () => {
  let component: Registerusers;
  let fixture: ComponentFixture<Registerusers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Registerusers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Registerusers);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
