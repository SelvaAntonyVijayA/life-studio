import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule }   from '@angular/forms';
import { HttpModule } from '@angular/http';
import {HttpClientModule} from '@angular/common/http';

import { AppRoutesModule } from './app-routes/app-routes.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';


import { LoginService } from './services/login.service';
import { HeaderService } from './services/header.service';
import { HomeComponent } from './components/home/home.component';
import { HeaderComponent } from './components/header/header.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    HeaderComponent,
  ],
  imports: [
    BrowserModule, HttpClientModule, AppRoutesModule, FormsModule, HttpModule
  ],
  providers: [LoginService, HeaderService],
  bootstrap: [AppComponent]
})
export class AppModule { }
