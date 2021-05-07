const Scratch = require("./api.js"),
  Projects = require("./lib/projects");

(async () => {
  let s = new Scratch.UserSession();
  await s.load();
  await s.verify();
  let p = new Projects(s);
  let project = await p.get(452968795);
  console.log(project);
})()
