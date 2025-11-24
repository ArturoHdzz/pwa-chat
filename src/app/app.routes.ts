import { Routes } from '@angular/router';
import { authGuard } from './shared/guards/auth-guard';
import { Chat } from './chat/chat';
import { Register } from './auth/register/register';
import { Login } from './shared/components/login/login';

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
                path: 'operaciones',
                loadComponent: () => import('./shared/components/operaciones/operaciones').then(m => m.Operaciones)
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
            { path: 'chat', component: Chat },
            { path: '', redirectTo: 'home', pathMatch: 'full' }
        ]
    },
    { path: '**', redirectTo: 'login', pathMatch: 'full' }
];
