var CONFIG = require ('./config.js');
var SECRET = require ('./secret.js');

var fs     = require ('fs');
var spawn  = require ('child_process').spawn;
Error.stackTraceLimit = Infinity;

var dale   = require ('dale');
var teishi = require ('teishi');
var lith   = require ('lith');
var cicek  = require ('cicek');
var redis  = require ('redis').createClient ({db: CONFIG.redisdb});
var giz    = require ('giz');
var hitit  = require ('hitit');
giz.redis  = redis;

var bcrypt = require ('bcryptjs');
var mailer = require ('nodemailer').createTransport (require ('nodemailer-ses-transport') (SECRET.ses));

redis.keyscan = function (match, cb, cursor, keys) {
   if (! cursor) cursor = 0;
   if (! keys)   keys   = {};
   redis.scan (cursor, 'MATCH', match, function (error, result) {
      if (error) return cb (error);
      cursor = result [0];
      dale.do (result [1], function (key) {
         keys [key] = true;
      });
      if (cursor !== '0') return redis.keyscan (match, cb, cursor, keys);
      cb (null, dale.keys (keys));
   });
}

var type = teishi.t, log = teishi.l, reply = cicek.reply, stop = function (rs, rules) {
   return teishi.stop (rules, function (error) {
      reply (rs, 400, {error: error});
   });
}

var hit = function (command, cb) {

   var output = {out: '', err: ''};

   var proc = spawn (command [0], command.slice (1));

   var wait = 3;

   var done = function () {
      if (--wait > 0) return;
      if (output.err !== '' || output.code !== 0) return cb (output);
      cb (null, output);
   }

   dale.do (['stdout', 'stderr'], function (v) {
      proc [v].on ('data', function (chunk) {
         output [v.replace ('std', '')] += chunk;
      });
      proc [v].on ('end', done);
   });

   proc.on ('error', function (error) {
      output.err += error + ' ' + error.stack;
      done ();
   });
   proc.on ('exit',  function (code, signal) {output.code = code; output.signal = signal; done ()});
}

// *** ROUTES ***

var routes = [

   // *** STATIC ASSETS ***

   ['get', '/lib/(*)', cicek.file, ['lib']],
   ['get', 'client.js', cicek.file],
   ['get', '/', reply, view, 'html'],

];

// *** LAUNCH SERVER ***

cicek.options.cookieSecret = SECRET.cookie;
cicek.options.log.body = function (log) {
   if (log.requestBody && log.requestBody.password) return false;
   return true;
}

cicek.apres = function (response) {
   if (response.log.requestBody && response.log.requestBody.password) {
      response.log.requestBody.password = '';
   }
   cicek.Apres (response);
}

cicek.cluster ();

cicek.listen ({port: CONFIG.port}, routes);

