const s2n = require("stringstonumbers"),
  https = require("https"),
  util = require("util"),
  WebSocket = require("ws"),
  Listenable = require("listenable"),
  UserSession = require("./lib/usersession");

let Scratch = {};

(async () => {
  let s = new UserSession();
  await s.load();
  
})()