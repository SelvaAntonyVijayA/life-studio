var parse = function csv2objArr(data, strip, callback) {
    (strip instanceof Function) ? (callback = strip, strip = 0) : (strip = strip || 0);
    //Did the user specify strip?
    data = data.split('\n' || '\r');
    if (strip) {
        for (var elem in data) {//loop to convert "val, val, val" to ["val", " val", " val"]
            var tmpArr = data[elem].split(',');
            for (var tmpElem in tmpArr) {//loop to convert ["val", " val", " val"] to ["val", "val", "val"]
                tmpArr[tmpElem] = tmpArr[tmpElem].trim();
            }
            data[elem] = tmpArr.join();
            //convert ["val", "val", "val"] to "val,val,val"
        }
    }
    var arrOfObjs = [];
    //build object keys
    var keys = data[0].split(',');
    //Iterate through data, creating a new Object and inserting obj into arrOfObjs
    for (var i = 1; i < data.length; i++) {//We start at 1 here so that we don't get {key:key}. We want {key:val}
        var tmp = data[i].split(',');
        var obj = {};
        for (var ii = 0; ii < tmp.length; ii++) {
            obj[keys[ii]] = tmp[ii];
        }
        arrOfObjs.push(obj);
    }
    callback(arrOfObjs);
};

module.exports = {
    "parse": parse
};