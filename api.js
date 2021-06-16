const UserSession = require("./lib/usersession");
const CloudSession = require("./lib/cloudsession");
const API = require("./lib/api");
const { ProjectsStatic: Projects } = require("./lib/projects");

let Scratch = {
  UserSession,
  CloudSession,
  Projects,
  API,
};

module.exports = Scratch;
