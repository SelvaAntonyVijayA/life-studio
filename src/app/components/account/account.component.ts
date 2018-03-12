import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonService } from '../../services/common.service';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { Utils } from '../../helpers/utils';
import { AccountService } from '../../services/account.service';
import { LoaderSharedService } from '../../services/loader-shared.service';

@Component({
  selector: 'account-update',
  outputs: ["dropped"],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {
  constructor(private cms: CommonService,
    private accountService: AccountService,
    private loaderShared: LoaderSharedService,
    public utils: Utils
  ) {

  }

  oid: string = "";
  users: any[] = [];
  name: string = "";
  lastName: string = "";
  password: string = "";
  confirmPassword: string = "";
  email: string = "";

  updateUser(e: any) {
    e.preventDefault();
    e.stopPropagation();
    this.loaderShared.showSpinner(true);

    if (this.utils.isNullOrEmpty(this.name)) {
      this.loaderShared.showSpinner(false);
      alert('Name should not empty');
      return false;
    }

    if (this.utils.isNullOrEmpty(this.password)) {
      this.loaderShared.showSpinner(false);
      alert('Password should not empty');
      return false;
    }

    if (this.password != this.confirmPassword) {
      this.loaderShared.showSpinner(false);
      alert('Password doesnt match! Unable to Update');
      return false;
    }

    this.accountService.userUpdate(this.getUserObj())
      .then(res => {
        this.password = "";
        this.confirmPassword = "";
        this.loaderShared.showSpinner(false);
        alert('User successfully updated');
        return false;
      });
  };

  userGet() {
    this.accountService.userGet()
      .then(userObj => {
        this.setUserObj(userObj);
        this.loaderShared.showSpinner(false);
      });
  };

  getUserObj() {
    var obj = {};

    obj["name"] = this.name;
    obj["lastName"] = this.lastName;
    obj["password"] = this.password;

    return obj;
  };

  setUserObj(objUsers: Object) {

    if (!this.utils.isEmptyObject(objUsers)) {
      this.name = objUsers.hasOwnProperty("name") ? objUsers["name"] : "";
      this.lastName = objUsers.hasOwnProperty("lastName") ? objUsers["lastName"] : "";
      this.email = objUsers.hasOwnProperty("email") ? objUsers["email"] : "";
    }
  };

  passwordChange(e: any) {
    if (!this.utils.isNullOrEmpty(this.password) && !this.utils.isNullOrEmpty(this.confirmPassword)) {

      if (this.password != this.confirmPassword) {
        alert('Password doesnt match');
      }
    }
  }

  ngOnInit() {
    this.userGet();
  }
}
