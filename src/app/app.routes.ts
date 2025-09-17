import { Routes } from '@angular/router';
import { authGuard } from './shared/guards/auth-guard';

export const routes: Routes = [
    {
        path: 'login', 
        loadComponent: () => import('./shared/components/login/login').then(m => m.Login)
    },
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
            { path: '', redirectTo: 'home', pathMatch: 'full' }
        ]
    },
    { path: '**', redirectTo: 'login', pathMatch: 'full' }
];