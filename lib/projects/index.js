"use strict";

const { request, getJSON } = require("../request");

class Project {
  constructor(d) {
    this.stage = new Sprite(d.targets.filter((s) => s.isStage)[0]);
    this.variables = {};
    let globalVars = Object.keys(
      d.targets.filter((s) => s.isStage)[0].variables
    ).map((k) => d.targets.filter((s) => s.isStage)[0].variables[k]);
    let cloudVars = globalVars.filter((v) => !!v[2]).map((v) => v[0]);

    for (let m of d.monitors) {
      if (m.id === "answer") continue;
      this.variables[m.params.VARIABLE || m.params.LIST] = {
        id: m.id,
        spriteOnly: !!m.spriteName,
        sprite: m.spriteName,
        value: m.value,
        type: m.mode === "default" ? "variable" : "list",
        isCloud: cloudVars.includes(m.params.VARIABLE || m.params.LIST),
      };
    }

    this.spritenames = d.targets.map((s) => s.name);
    this.sprites = [];

    for (let t of d.targets.filter((s) => !s.isStage)) {
      this.sprites.push(new Sprite(t));
    }
  }
}

class Sprite {
  constructor(d) {
    this.variables = {};
    if (!d.variables) d.variables = {};

    for (let v in d.variables) {
      this.variables[d.variables[v][0]] = d.variables[v][1];
    }

    this.lists = {};
    if (!d.lists) d.lists = {};

    for (let v in d.lists) {
      this.lists[d.lists[v][0]] = d.lists[v][1];
    }

    this.broadcasts = [];
    if (!d.broadcasts) d.broadcasts = {};

    for (let v in d.broadcasts) {
      this.broadcasts.push(d.broadcasts[v]);
    }

    this.blocks = [];
    if (!d.blocks) d.blocks = {};

    for (let v in d.blocks) {
      this.blocks.push(d.blocks[v]);
    }

    this.comments = [];
    if (!d.comments) d.comments = {};

    for (let v in d.comments) {
      this.comments.push(d.comments[v]);
    }

    this.isStage = !!d.isStage;
    this.name = d.name;
    this.costumes = d.costumes;
    this.sounds = d.sounds;
    this.volume = d.volume;
    this.layer = d.layerOrder;
  }
}

class Projects {
  constructor(u) {
    this.usersession = u;
  }

  async get(id) {
    return new Project(
      await getJSON({
        hostname: "projects.scratch.mit.edu",
        path: `/${id}`,
      })
    );
  }

  async getUserProjects(u) {
    let t = u || this.usersession;
    if (!t) return null;
    return await getJSON({
      hostname: "api.scratch.mit.edu",
      path: `/users/${typeof t === "object" ? t.username : t}/projects`,
    });
  }
}

module.exports = Projects;
