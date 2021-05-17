const Scratch = require("./api.js");

(async function () {
  const s = await Scratch.UserSession.create();
  await s.verify();
  let cloud = await s.cloudSession(1);
  console.log(cloud);
})();

("");
