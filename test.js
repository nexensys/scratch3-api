const Scratch = require("./api.js");

(async () => {
  let s = new Scratch.UserSession();
  await s.load();
  await s.verify();
  let cloud = await s.cloudSession(526187216);
  cloud.on("set", (n, v) => {
    if (n === cloud.name("User")) {
      cloud.set(n, cloud.numerify("Hello"))
    }
  })
})()
