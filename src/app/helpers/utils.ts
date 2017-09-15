export class Utils {
  public static htmlEncode(text: string) {
    text = text.replace(/'/g, "&#39;");
    return text;
  }

  public static htmlDecode(text: string) {
    text = text.replace("&#39;", "'");
    return text;
  }

  public static escapingQuotes(stringElem: string) {
    if (stringElem && stringElem != "" && stringElem != null && typeof stringElem !== "undefined") {
      stringElem = stringElem.replace(/'/g, "&apos;");
      stringElem = stringElem.replace(/"/g, "&#34;");
    }

    return stringElem;
  };
}