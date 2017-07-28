var arg = function(pos) {
  if(argsValid(pos)) {
    return getArg(pos);
  }
};

var argsValid = function(pos) {
  return argv.length >= pos -1;
};

var getArg = function(pos) {
  return argv[pos];
};

module.exports = {"arg" : arg};
