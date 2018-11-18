var dale   = require ('dale');
var teishi = require ('teishi');

var fs = require ('fs');

var cberror = function (error) {
   process.stderr.write (error.toString ());
   process.exit (1);
}

fs.readFile ('input.json', 'utf8', function (error, data) {
   if (error) return cberror (error);

   data = JSON.parse (data);

   data.data.push (Date.now ());

   process.stdout.write (JSON.stringify (data));
});
