import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupMembers } from './group-members';

describe('GroupMembers', () => {
  let component: GroupMembers;
  let fixture: ComponentFixture<GroupMembers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupMembers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupMembers);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
