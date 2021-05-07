const { request, getJSON } = require("../request");

class Project {
  constructor (d) {
    this.stage = d.targets.filter(s => s.isStage)[0];
    this.variables = {};
    for (let m of d.monitors) {
      if (m.id === "answer") continue;
      this.variables[m.params.VARIABLE || m.params.LIST] = {
        id: m.id,
        spriteOnly: !!m.spriteName,
        sprite: m.spriteName,
        value: m.value,
        type: m.mode === "default" ? "variable" : "list",
      };
    };
    this.spritenames = d.targets.map(s => s.name);
    this.sprites = [];
    for (let t of d.targets.filter(s => !s.isStage)) {
      this.sprites.push(new Sprite(t));
    }
  }
}

class Sprite {
  constructor (d) {
    this.variables = {};
    for (let v of d.variables) {
      this.variables[v[0]] = v[1];
    }
    this.lists = {};
    for (let v of d.lists) {
      this.lists[v[0]] = v[1];
    }
    this.broadcasts = [];
    for (let v of d.broadcasts) {
      this.broadcasts.push(v);
    }
    this.blocks = [];
    for (let v of d.blocks) {
      this.blocks.push(v);
    }
    this.comments = [];
    for (let v of d.comments) {
      this.comments.push(v);
    }
    this.isStage = d.isStage;
    this.name = d.name;
    this.costumes = d.costumes;
    this.sounds = d.sounds;
    this.volume = d.volume;
    this.layer = d.layerOrder;
  }
}

class Projects {
  constructor (u) {
    this.usersession = u
  }

  async get (id) {
    return new Project(await getJSON({
      hostname: "projects.scratch.mit.edu",
      path: `/${id}`
    }));
  }

  async getUserProjects (u) {
    let t = u || this.usersession;
    if (!t) return null;
    return await getJSON({
      hostname: "api.scratch.mit.edu",
      path: `/users/${typeof t === "object" ? t.username : t}/projects`
    });
  }
}

module.exports = Projects;