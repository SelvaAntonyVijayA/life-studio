export class Utils {
  // Encode a given string
  public static htmlEncode(text: string) {
    text = text.replace(/'/g, "&#39;");
    return text;
  };

  // Decode a given string
  public static htmlDecode(text: string) {
    text = text.replace("&#39;", "'");
    return text;
  };

  // Converting quotes to escaping quotes from the given string
  public static escapingQuotes(stringElem: string) {
    if (stringElem && stringElem != "" && stringElem != null && typeof stringElem !== "undefined") {
      stringElem = stringElem.replace(/'/g, "&apos;");
      stringElem = stringElem.replace(/"/g, "&#34;");
    }

    return stringElem;
  };

  // Check wheather the given value is empty or not
  public static isNullOrEmpty(str: any) {
    return (typeof str === "undefined" || str === null || str === "") ? true : (typeof str === "string" && str.trim().length > 0) || (typeof str === "boolean" || typeof str === "object" || typeof str === "number" || typeof str === "function") ? false : true;
  };

  // Coverting a given string to boolean
  public static convertToBoolean(value: any) {
    return value = typeof value === "boolean" ? value : typeof value === "string" ? Boolean(value) : false;
  };

  // Check wheather the given object is empty or not
  public static isEmptyObject(obj: any) {
    return (typeof obj === "undefined" || obj === null || obj === "") ? false : (obj && (Object.keys(obj).length === 0));
  }

  // Getting parameters from the given url
  public static getParameterByName(name: any) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"), results = regex.exec(location.search);

    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  };

  // Check wheather the given array is array or not
  public static isArray(obj: any) {
    return !!obj && obj.constructor === Array;
  };

  // Move an array from given position to the mentioned position
  public static arrayMove(arr: any[], fromIndex: number, toIndex: number) {
    var element = arr[fromIndex];
    arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, element);
  };

  //Check wheather the number is decimal or not
  public static isDecimal(num: number) {
    return isNaN(num) ? false : num % 1 === 0 ? false : true;
  };

  //Check wheather a string or object is valid date
  public static isDate = function (date: any) {
    return toString.call(date) === '[object Date]' && !isNaN(date);
  };

  // Converting Date Object or Date string to UTC format 
  public static toUTCDateTime = function (dt: any) {
    var result = "";

    if (!this.isNullOrEmpty(dt)) {
      var dateObj = dt instanceof Date ? dt : typeof dt === "string" ? new Date(dt) : dt;

      if (this.isDate(dateObj)) {
        result = dateObj.toUTCString();
      }
    }

    var resultOutput = !this.isNullOrEmpty(result)? result.toLowerCase() : result;

    return resultOutput;
  };

  // Converting Date Object or Date string to local format 
  public static toLocalDateTime = function (dt: any, format?: any) {
    var result = "";
    var currentFormat = !this.isNullOrEmpty(format) ? format : "mm/dd/yy gg:ii a";

    if (!this.isNullOrEmpty(dt)) {
      var dateObj = dt instanceof Date ? dt : typeof dt === "string" ? new Date(dt) : dt;

      if (this.isDate(dateObj)) {
        result = this.formatDateTime(dateObj, currentFormat);
      }
    }

    var resultOutput = !this.isNullOrEmpty(result)? result.toLowerCase() : result;

    return resultOutput;
  };

  // Converting the date to the given format
  public static formatDateTime = function (date?: Date, format?: string) {
    var output = '';
    var literal = false;
    var iFormat = 0;
    var settings = {
      monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      ampmNames: ['AM', 'PM'],
      attribute: 'data-datetime',
      formatAttribute: 'data-dateformat'
    };

    var ticksTo1970 = (((1970 - 1) * 365 + Math.floor(1970 / 4)
      - Math.floor(1970 / 100)
      + Math.floor(1970 / 400)) * 24 * 60 * 60 * 10000000);

    // Check whether a format character is doubled
    var lookAhead = function (match) {
      var matches = (iFormat + 1 < format.length
        && format.charAt(iFormat + 1) == match);
      if (matches) {
        iFormat++;
      }
      return matches;
    };

    // Format a number, with leading zero if necessary
    var formatNumber = function (match, value, len) {
      var num = '' + value;
      if (lookAhead(match)) {
        while (num.length < len) {
          num = '0' + num;
        }
      }
      return num;
    };

    // Format a name, short or long as requested
    var formatName = function (match, value, shortNames, longNames) {
      return (lookAhead(match) ? longNames[value] : shortNames[value]);
    };

    for (iFormat = 0; iFormat < format.length; iFormat++) {
      if (literal) {
        if (format.charAt(iFormat) == "'" && !lookAhead("'")) {
          literal = false;
        }
        else {
          output += format.charAt(iFormat);
        }
      } else {
        switch (format.charAt(iFormat)) {
          case 'a':
            output += date.getHours() < 12
              ? settings.ampmNames[0]
              : settings.ampmNames[1];
            break;
          case 'd':
            output += formatNumber('d', date.getDate(), 2);
            break;
          case 'D':
            output += formatName('D',
              date.getDay(),
              settings.dayNamesShort,
              settings.dayNames);
            break;
          case 'o':
            var end = new Date(date.getFullYear(),
              date.getMonth(),
              date.getDate()).getTime();
            var start = new Date(date.getFullYear(), 0, 0).getTime();
            output += formatNumber(
              'o', Math.round((end - start) / 86400000), 3);
            break;
          case 'g':
            var hour = date.getHours() % 12;
            output += formatNumber('g', (hour === 0 ? 12 : hour), 2);
            break;
          case 'h':
            output += formatNumber('h', date.getHours(), 2);
            break;
          case 'u':
            output += formatNumber('u', date.getMilliseconds(), 3);
            break;
          case 'i':
            output += formatNumber('i', date.getMinutes(), 2);
            break;
          case 'm':
            output += formatNumber('m', date.getMonth() + 1, 2);
            break;
          case 'M':
            output += formatName('M',
              date.getMonth(),
              settings.monthNamesShort,
              settings.monthNames);
            break;
          case 's':
            output += formatNumber('s', date.getSeconds(), 2);
            break;
          case 'y':
            output += (lookAhead('y')
              ? date.getFullYear()
              : (date.getFullYear() % 100 < 10 ? '0' : '')
              + date.getFullYear() % 100);
            break;
          case '@':
            output += date.getTime();
            break;
          case '!':
            output += date.getTime() * 10000 + ticksTo1970;
            break;
          case "'":
            if (lookAhead("'")) {
              output += "'";
            } else {
              literal = true;
            }
            break;
          default:
            output += format.charAt(iFormat);
        }
      }
    }

    return output;
  };

  public static compareObj = function (x: any, y: any) {
    var self = this;

    if (x instanceof Function) {
      if (y instanceof Function) {
        return x.toString() === y.toString();
      }
      return false;
    }
    if (x === null || x === undefined || y === null || y === undefined) { return x === y; }
    if (x === y || x.valueOf() === y.valueOf()) { return true; }

    // if one of them is date, they must had equal valueOf
    if (x instanceof Date) { return false; }
    if (y instanceof Date) { return false; }

    // if they are not function or strictly equal, they both need to be Objects
    if (!(x instanceof Object)) { return false; }
    if (!(y instanceof Object)) { return false; }

    var p = Object.keys(x);
     
    return Object.keys(y).every(function (i) { return p.indexOf(i) !== -1; }) ?
      p.every(function (i) { return self.compareObj(x[i], y[i]); }) : false;
  };

  public static trim = function (str: any) {
    if (!this.isNullOrEmpty(str)) {
      str.replace(/^\s+|\s+$/gm, '');
    }

    return str;
  };
}