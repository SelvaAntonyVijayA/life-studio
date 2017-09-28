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
    return (typeof str === "undefined" || str === null || str === "") ? true : (typeof str === "string" && str.trim().length > 0) || (typeof str=== "boolean" || typeof str === "object" || typeof str === "number" || typeof str === "function") ? false : true;
  };

  public static convertToBoolean(value: any) {
    return value = typeof value === "boolean" ? value : typeof value === "string" ? Boolean(value) : false;
  };

  public static isEmptyObject(obj: any) {
    return (obj && (Object.keys(obj).length === 0));
  }
}