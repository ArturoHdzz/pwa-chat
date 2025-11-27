import { Routes } from '@angular/router';
import { authGuard } from './shared/guards/auth-guard';
import { Chat } from './shared/components/movil/chat/chat';

export const routes: Routes = [
    {
        path: 'login', 
        loadComponent: () => import('./shared/components/login/login').then(m => m.Login)
    },
     { path: 'chat', component: Chat },     
    {
        path: '',
        canActivate: [authGuard],
        loadComponent: () => import('./shared/components/layout/layout').then(m => m.Layout),
        children: [
            {
                path: 'home',
                loadComponent: () => import('./shared/components/home/home').then(m => m.Home)
            },
            {
                path: 'users',
                loadComponent: () => import('./shared/components/registerusers/registerusers').then(m => m.Registerusers)
            },
            {
                path: 'groups',
                loadComponent: () => import('./shared/components/groups/groups').then(m => m.Groups)
            },
            {
                path: 'groups/:id',
                loadComponent: () => import('./shared/components/group-details/group-details').then(m => m.GroupDetails)
            },
            {
                path: 'groups/:id/members',
                loadComponent: () => import('./shared/components/group-members/group-members/group-members').then(m => m.GroupMembers)
            },
            {
                path: 'groups/:id/tasks',
                loadComponent: () => import('./shared/components/group-tasks/group-tasks').then(m => m.GroupTasks)
            },
            {
                path: 'groups/:id/tasks/:taskId/grading',
                loadComponent: () => import('./shared/components/task-grading/task-grading').then(m => m.TaskGrading)
            },
            {
                path: 'tasks/individual',
                loadComponent: () => import('./shared/components/individual-tasks/individual-tasks').then(m => m.IndividualTasks)
            },
            {
                path: 'dashboard',
                loadComponent: () => import('./shared/components/dashboard/dashboard').then(m => m.Dashboard)
            },
            { path: 'chat', component: Chat },
            { path: '', redirectTo: 'home', pathMatch: 'full' }
        ]
    },
    {
        path: 'm',
        canActivate: [authGuard],
        loadComponent: () => import('./shared/components/movil/mobile-shell/mobile-shell').then(m => m.MobileShell),
        children: [
            
            {
                path: 'chat',
                loadComponent: () => import('./shared/components/movil/chat-list/chat-list').then(m => m.ChatList)
            },
            {
                path: 'chat/:id',
                loadComponent: () => import('./shared/components/movil/chat/chat').then(m => m.Chat)
            },
            {
              path:'users/:orgId',
                loadComponent: () => import('./shared/components/movil/users-list/users-list').then(m => m.UsersList)  
            },
            {
                path:'tasks',
                  loadComponent: () => import('./shared/components/movil/tasks/tasks').then(m => m.Tasks)  
            },
            {
                path:'calendar',
                    loadComponent: () => import('./shared/components/movil/calendar/calendar').then(m => m.Calendar)
            }
        ]
    },
    { path: '**', redirectTo: 'login', pathMatch: 'full' }
];
