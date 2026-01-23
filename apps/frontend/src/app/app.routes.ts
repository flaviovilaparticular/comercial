import { Route } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './users/login/login.component';
import { MenuComponent } from './menu/menu.component';
import { UserAbmComponent } from './user-abm/user-abm.component';
// parametros
import { CentroCostosComponent } from './Parametros/CentroCostos/CentroCostos.component';
import { SucursalesComponent } from './Parametros/Sucursales/Sucursales.component';
import { IndicesComponent } from './Parametros/Indices/indices.component';
import { BancosAbmComponent } from './Parametros/Bancos/Bancos.component';

export const appRoutes: Route[] = [
    {
        path: '',
        component: LayoutComponent,
        children: [
            { path: '', redirectTo: 'home', pathMatch: 'full' },
            { path: 'home', component: HomeComponent },
            { path: 'login', component: LoginComponent },
            { path: 'menu', component: MenuComponent },
            { path: 'userabm', component: UserAbmComponent },

            // parametros
            {
                path: 'centrocostos',
                children: [
                    { path: '', component: CentroCostosComponent },
                    { path: ':idCentro', component: SucursalesComponent }
                ]
            }
            ,
            { path: 'indices', component: IndicesComponent },
            { path: 'bancos', component: BancosAbmComponent }
        ]
    },
    { path: '**', redirectTo: 'home' }
];
