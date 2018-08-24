import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
//import { UpgradeModule } from '@angular/upgrade/static';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { AppRoutesModule } from './app-routes/app-routes.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';

import { LoginService } from './services/login.service';
import { LoaderSharedService } from './services/loader-shared.service';
import { NotFoundComponent } from './components/not-found/not-found.component';

import { AlertComponent, AlertsComponent } from './components/alert/alert.component';
import { AlertService } from './services/alert.service';
import { LoggerService } from './services/logger.service';
import { MessageService } from './services/message.service';
import { HttpErrorHandlerService } from './services/http-error-handler.service';
import { Utils } from './helpers/utils';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    NotFoundComponent,
    AlertComponent,
    AlertsComponent
  ],
  imports: [
    BrowserModule, BrowserAnimationsModule, AppRoutesModule, FormsModule, ReactiveFormsModule, HttpModule, HttpClientModule
  ],
  providers: [LoginService, AlertService, MessageService, HttpErrorHandlerService, LoggerService, Utils, LoaderSharedService, HttpClient],
  bootstrap: [AppComponent]
})
export class AppModule { }
