import { Route } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './users/login/login.component';

export const appRoutes: Route[] = [
    {
        path: '',
        component: LayoutComponent,
        children: [
            { path: '', redirectTo: 'home', pathMatch: 'full' },
            { path: 'home', component: HomeComponent },
            { path: 'login', component: LoginComponent },
        ]
    },
    { path: '**', redirectTo: 'home' }
];
