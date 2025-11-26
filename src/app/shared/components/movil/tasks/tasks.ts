import { Component } from '@angular/core';
import { ChatHeader } from '../chat-header/chat-header';
@Component({
  selector: 'app-tasks',
  imports: [ChatHeader],
  templateUrl: './tasks.html',
  styleUrl: './tasks.css'
})
export class Tasks {


  onOrgChange(orgId: string) {

  }
}
