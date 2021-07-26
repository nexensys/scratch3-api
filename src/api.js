"use strict";

import UserSession from "./usersession";
import CloudSession from "./cloudsession";
import { ProjectsStatic as Projects } from "./projects";
import Rest from "./rest";

const Scratch = {
  UserSession,
  CloudSession,
  Projects,
  Rest
};

export default Scratch;

export { UserSession, CloudSession, Projects, Rest };
