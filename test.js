const Scratch = require("./api.js");

(async () => {
  let s = new Scratch.UserSession();
  await s.load();
  await s.verify();
})()
