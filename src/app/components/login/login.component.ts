import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { Cookie } from 'ng2-cookies/ng2-cookies';

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent {
  model: any = {};
  loading = false;
  error = '';

  constructor(private router: Router, private loginService: LoginService) { }

  login() {
    this.loginService.login(this.model.username, this.model.password).then(user => {
      if (user && user.userfound) {
        var dateTime = new Date().toISOString();
        Cookie.set('page', 'ili'); 
        Cookie.set('pageUpdated', dateTime);
        Cookie.set('pageName', "");
        
        this.router.navigate(['./home'], {queryParams: { "_dt": '1467038311', 'index': 'ili'} });
      } else {
        this.error = 'Username or password is incorrect';
        //this.loading = false;
      }
    });
  }
}
