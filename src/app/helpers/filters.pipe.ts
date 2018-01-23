import { Pipe, PipeTransform } from '@angular/core';
import { Utils } from '../helpers/utils';

@Pipe({
  name: 'filterByText',
  pure: false
})
export class FilterByTextPipe implements PipeTransform {
  constructor(public utils: Utils) {
  }

  transform(reqArray: any[], propName?: string, searchTxt?: string, page?: string): any {
    if ((this.utils.isArray(reqArray) && reqArray.length > 0 && !this.utils.isNullOrEmpty(propName) && !this.utils.isNullOrEmpty(searchTxt) && searchTxt !== "-1") || (!this.utils.isNullOrEmpty(page) && page === "category")) {

      return reqArray.filter(function (prop) {
        return prop.hasOwnProperty(propName) && prop[propName].toLowerCase().indexOf(searchTxt.toLowerCase()) > -1;
      });
    } else {
      return reqArray;
    }
  };
};

@Pipe({
  name: 'orderBy',
  pure: false
})
export class OrderByPipe implements PipeTransform {
  constructor(public utils: Utils) {
  }

  transform(reqArray: any[], isAsc?: boolean, propName?: string, optPropName?: string): any {
    return this.utils.sortArray(reqArray, isAsc, propName, optPropName);
  };
};

@Pipe({
  name: 'reverse',
  pure: false
})
export class ReversePipe {
  transform(values) {
    if (values) {
      return values.reverse();
    }
  }
}


