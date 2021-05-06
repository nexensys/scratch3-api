const UserSession = require("./lib/usersession");
const CloudSession = require("./lib/cloudsession");

let Scratch = {
  UserSession: UserSession,
  CloudSession: CloudSession
};

module.exports = Scratch;