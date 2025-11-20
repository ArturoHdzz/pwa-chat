import { Routes } from '@angular/router';
import { Chat } from './chat/chat';
import { Login } from './auth/login/login';
import { Register } from './auth/register/register';

export const routes: Routes = [

  { path: 'chat', component: Chat },
  { path: '', component: Login },
  { path: 'register', component: Register }

];
