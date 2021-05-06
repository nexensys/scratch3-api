const UserSession = require("./lib/usersession");
const CloudSession = require("./lib/cloudsession");

let Scratch = {
  UserSession: UserSession,
  CloudSession: CloudSession
};

(async () => {
  let s = new Scratch.UserSession();
  await s.load();
  await s.verify();
  let cloud = await s.cloudSession(526187216);
  cloud.on("set", (n, v) => {
    console.log(`${n} is ${v}`);
  });
})()