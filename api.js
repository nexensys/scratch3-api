const UserSession = require("./lib/usersession");
const CloudSession = require("./lib/cloudsession");
const { ProjectsStatic: Projects } = require("./lib/projects");

let Scratch = {
  UserSession,
  CloudSession,
  Projects,
};

module.exports = Scratch;
