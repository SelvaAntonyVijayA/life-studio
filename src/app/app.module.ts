import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { AppRoutesModule } from './app-routes/app-routes.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';

import { LoginService } from './services/login.service';
import { NotFoundComponent } from './components/not-found/not-found.component';

import { AlertComponent } from './components/alert/alert.component';
import { AlertsComponent } from './components/alerts/alerts.component';
import { AlertService } from './services/alert.service';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    NotFoundComponent,
    AlertComponent,
    AlertsComponent
  ],
  imports: [
    BrowserModule, BrowserAnimationsModule, HttpClientModule, AppRoutesModule, FormsModule, HttpModule
  ],
  providers: [LoginService, AlertService],
  bootstrap: [AppComponent]
})
export class AppModule { }
