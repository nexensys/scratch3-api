const s2n = require("stringstonumbers"),
  https = require("https"),
  util = require("util"),
  WebSocket = require("ws"),
  Listenable = require("listenable"),
  UserSession = require("./lib/usersession");

let Scratch = {
  UserSession: UserSession,
};

(async () => {
  let s = new Scratch.UserSession();
  await s.load();
  await s.verify();
})()