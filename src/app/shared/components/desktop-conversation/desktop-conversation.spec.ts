import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DesktopConversation } from './desktop-conversation';

describe('DesktopConversation', () => {
  let component: DesktopConversation;
  let fixture: ComponentFixture<DesktopConversation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DesktopConversation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DesktopConversation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
