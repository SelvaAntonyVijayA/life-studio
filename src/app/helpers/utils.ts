export class Utils {
  public static htmlEncode(text: string) {
    text = text.replace(/'/g, "&#39;");
    return text;
  };

  public static htmlDecode(text: string) {
    text = text.replace("&#39;", "'");
    return text;
  };

  public static escapingQuotes(stringElem: string) {
    if (stringElem && stringElem != "" && stringElem != null && typeof stringElem !== "undefined") {
      stringElem = stringElem.replace(/'/g, "&apos;");
      stringElem = stringElem.replace(/"/g, "&#34;");
    }

    return stringElem;
  };

  public static isNullOrEmpty(str: any) {
    return (typeof str === "undefined" || str === null || str === "") ? true : (typeof str === "string" && str.trim().length > 0) || (typeof str === "boolean" || typeof str === "object" || typeof str === "number" || typeof str === "function") ? false : true;
  };

  public static convertToBoolean(value: any) {
    return value = typeof value === "boolean" ? value : typeof value === "string" ? Boolean(value) : false;
  };

  public static isEmptyObject(obj: any) {
    return (typeof obj === "undefined" || obj === null || obj === "") ? false : (obj && (Object.keys(obj).length === 0));
  }

  public static getParameterByName(name: any) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"), results = regex.exec(location.search);

    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  };

  public static isArray(obj: any) {
    return !!obj && obj.constructor === Array;
  };

  public static arrayMove(arr: any[], fromIndex: number, toIndex: number) {
    var element = arr[fromIndex];
    arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, element);
  };

  public static isDecimal(num: number) {
    return isNaN(num) ? false : num % 1 === 0 ? false : true;
  };
}