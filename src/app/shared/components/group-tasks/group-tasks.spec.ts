import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupTasks } from './group-tasks';

describe('GroupTasks', () => {
  let component: GroupTasks;
  let fixture: ComponentFixture<GroupTasks>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupTasks]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupTasks);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
