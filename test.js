const Scratch = require("./api.js");

(async function () {
  const s = await Scratch.UserSession.create();
  await s.verify();
  let p = await s.projects.getUserProjects(1);
  console.log(p[0]);
})();

("");
