import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndividualTasks } from './individual-tasks';

describe('IndividualTasks', () => {
  let component: IndividualTasks;
  let fixture: ComponentFixture<IndividualTasks>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndividualTasks]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndividualTasks);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
