import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from '../components/login/login.component';
import { HomeComponent } from '../components/home/home.component';
import { HeaderComponent } from '../components/header/header.component';
import { NotFoundComponent } from '../components/not-found/not-found.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'home',
    loadChildren: 'app/app-routes/home.module#HomeModule',
    data: { preload: true }
  },
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(routes, {
      useHash: true,
      enableTracing: true
    })
  ],
  exports: [RouterModule],
  declarations: []
})

export class AppRoutesModule { }
