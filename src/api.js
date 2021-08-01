"use strict";

import UserSession from "./usersession.js";
import CloudSession from "./cloudsession.js";
import { ProjectsStatic as Projects } from "./projects.js";
import Rest from "./rest.js";

const Scratch = {
  UserSession,
  CloudSession,
  Projects,
  Rest
};

export default Scratch;

export { UserSession, CloudSession, Projects, Rest };
