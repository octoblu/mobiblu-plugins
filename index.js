'use strict';

var fs = require('fs');

var path = __dirname + '/plugins';

function getCompiledJSON(path) {
  var jsonArr = [];
  fs.readdirSync(path).forEach(function(file) {
    var newPath = path + '/' + file;
    var stat = fs.statSync(newPath);
    if (stat.isFile()) {
      if (/(.*)\.json/.test(file)) {
        jsonArr.push(require(newPath));
      }
    }
  });
  return jsonArr;
}

var plugins = getCompiledJSON(path);

var prettyJSON = JSON.stringify(plugins, null, 4);
fs.writeFileSync(__dirname + '/plugins.json', prettyJSON);