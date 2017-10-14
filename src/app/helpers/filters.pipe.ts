import { Pipe, PipeTransform } from '@angular/core';
import { Utils } from '../helpers/utils';

@Pipe({
  name: 'filterByText'
})
export class FilterByTextPipe implements PipeTransform {
  constructor() {
    this.utils = Utils;
  }

  utils: any;

  transform(reqArray: any[], propName?: string, searchTxt?: string): any {
    if (this.utils.isArray(reqArray) && reqArray.length > 0 && !this.utils.isNullOrEmpty(propName) && !this.utils.isNullOrEmpty(searchTxt)) {

      return reqArray.filter(function (prop) {
        return prop.hasOwnProperty(propName) && prop[propName].toLowerCase().indexOf(searchTxt.toLowerCase()) > -1;
      });
    } else {
      return reqArray;
    }
  };
};

@Pipe({
  name: 'orderBy'
})
export class OrderByPipe implements PipeTransform {
  constructor() {
    this.utils = Utils;
  }

  utils: any;

  transform(reqArray: any[], isAsc?: boolean, propName?: string, optPropName?: string): any {
    if (this.utils.isArray(reqArray) && reqArray.length > 0 && !this.utils.isNullOrEmpty(propName) && typeof isAsc !== "undefined") {
      var self = this;
      let direction = isAsc ? 1 : -1;

      return reqArray.sort(function (a, b) {
        var prop1 = a.hasOwnProperty(propName) ? propName : !self.utils.isNullOrEmpty(optPropName) && a.hasOwnProperty(optPropName) ? optPropName : "";
        var prop2 = b.hasOwnProperty(propName) ? propName : !self.utils.isNullOrEmpty(optPropName) && b.hasOwnProperty(optPropName) ? optPropName : "";

        if (a[prop1] < b[prop2]) {
          return -1 * direction;
        }
        else if (a[prop1] > b[prop2]) {
          return 1 * direction;
        }
        else {
          return 0;
        }
      });

    } else {
      return reqArray;
    }
  };
};


