"use strict";

import UserSession from "./usersession.js";
import CloudSession from "./cloudsession.js";
import { ProjectsStatic as Projects } from "./projects.js";
import Rest from "./rest.js";
import { AnyObject } from "./defs.js";

interface ScratchAPI {
  UserSession: typeof UserSession;
  CloudSession: typeof CloudSession;
  Projects: Projects;
  Rest: typeof Rest;
}
const Scratch: ScratchAPI = {
  UserSession,
  CloudSession,
  Projects,
  Rest
};

module.exports = Scratch;

export default Scratch;
