import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskGrading } from './task-grading';

describe('TaskGrading', () => {
  let component: TaskGrading;
  let fixture: ComponentFixture<TaskGrading>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskGrading]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskGrading);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
