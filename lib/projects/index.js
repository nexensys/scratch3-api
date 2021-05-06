const { request, getJSON } = require("../request");

class Projects {
  constructor (u) {
    this.usersession = u
  }

  async get (id) {
    return await getJSON({
      hostname: "api.scratch.mit.edu",
      path: `/${id}`
    });
  }

  async getUserProjects (u) {
    let t = u || this.usersession;
    if (!t) return null;
    return await getJSON({
      hostname: "api.scratch.mit.edu",
      path: `/users/${typeof t === "object" ? t.username : t}/projects`
    });
  }

  async getAll () {
    return await getJSON({
      hostname: "scratch.mit.edu",
      path: "/site-api/projects/all/",
      sessionId: this.usersession.sessionId
    });
  }
}

module.exports = Projects;