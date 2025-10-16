import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http'; // ✅ Importante
import { AppComponent } from './app/app.component';
import { appRoutes } from './app/app.routes';

bootstrapApplication(AppComponent, {
    providers: [
        provideRouter(appRoutes),
        provideHttpClient() // ✅ Esto habilita HttpClient en toda la app
    ]
});
