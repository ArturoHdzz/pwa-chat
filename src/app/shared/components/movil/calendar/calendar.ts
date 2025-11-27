import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule, NgFor, DatePipe } from '@angular/common';
import { IonContent } from '@ionic/angular/standalone';
import { Task } from '../../../models/task.model';
import { TasksService } from '../../../services/tasks/tasks-service'; 
import { ChatHeader } from '../chat-header/chat-header';
import { Spiner } from '../spiner/spiner';
type CalendarDay = {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  tasks: Task[]; 
  hasDueTask: boolean;
};

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, NgFor, IonContent, DatePipe,
    Spiner,
    ChatHeader
  ],
  templateUrl: './calendar.html',
})
export class Calendar implements OnInit {
  private tasksService = inject(TasksService);
  isLoading = signal(true);
  tasks = signal<Task[]>([]);
  currentMonth = signal<Date>(new Date()); // mes actual
  weeks = signal<CalendarDay[][]>([]);
  selectedDay = signal<CalendarDay | null>(null);

  weekdayLabels = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

onOrgChange(orgId: string) {}

  ngOnInit() {

    this.tasksService.getMyTasks().subscribe({
      next: (res) => {
        this.tasks.set(res);
        this.buildCalendar();
      },
      error: (err) => console.error('Error cargando tareas', err),
    });
  }


 buildCalendar() {
    const monthStart = new Date(
      this.currentMonth().getFullYear(),
      this.currentMonth().getMonth(),
      1
    );
    const monthEnd = new Date(
      this.currentMonth().getFullYear(),
      this.currentMonth().getMonth() + 1,
      0
    );

    const startWeekDay = (monthStart.getDay() + 6) % 7; // Lunes = 0
    const daysInMonth = monthEnd.getDate();

    const calendarDays: CalendarDay[] = [];

  for (let i = 0; i < startWeekDay; i++) {
      const date = new Date(monthStart);
      date.setDate(date.getDate() - (startWeekDay - i));
      calendarDays.push(this.makeCalendarDay(date, false));
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        this.currentMonth().getFullYear(),
        this.currentMonth().getMonth(),
        day
      );
      calendarDays.push(this.makeCalendarDay(date, true));
    }

    while (calendarDays.length % 7 !== 0) {
      const last = calendarDays[calendarDays.length - 1].date;
      const date = new Date(last);
      date.setDate(date.getDate() + 1);
      calendarDays.push(this.makeCalendarDay(date, false));
    }

    const weeks: CalendarDay[][] = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      weeks.push(calendarDays.slice(i, i + 7));
    }

    this.weeks.set(weeks);

   const today = calendarDays.find((d) => d.isToday && d.isCurrentMonth);
    this.selectedDay.set(today ?? weeks[0][0]);

    this.isLoading.set(false);} 
  private isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}


  private makeCalendarDay(date: Date, isCurrentMonth: boolean): CalendarDay {
    const today = new Date();
    const isToday =
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate();

    const tasksForDay = this.tasks()
      .filter((t) => this.dateInTaskRange(date, t))
      .map((t) => t);

      const hasDueTask = this.tasks().some((t) => {
    if (!t.due_at) return false;
    const dueDate = new Date(t.due_at);
    return this.isSameDay(date, dueDate);
  });
    return {
      date,
      isCurrentMonth,
      isToday,
      tasks: tasksForDay,
      hasDueTask
    };
  }

  private dateInTaskRange(date: Date, task: Task): boolean {
    if (!task.created_at || !task.due_at) return false;

    const d = this.startOfDay(date);
    const start = this.startOfDay(new Date(task.created_at));
    const end = this.startOfDay(new Date(task.due_at));

    return d >= start && d <= end;
  }

  private startOfDay(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  prevMonth() {
    const current = this.currentMonth();
    const newDate = new Date(current.getFullYear(), current.getMonth() - 1, 1);
    this.currentMonth.set(newDate);
    this.buildCalendar();
  }

  nextMonth() {
    const current = this.currentMonth();
    const newDate = new Date(current.getFullYear(), current.getMonth() + 1, 1);
    this.currentMonth.set(newDate);
    this.buildCalendar();
  }

  selectDay(day: CalendarDay) {
    this.selectedDay.set(day);
  }

  // tareas del día seleccionado
  get selectedDayTasks() {
    return this.selectedDay()?.tasks ?? [];
  }
}

