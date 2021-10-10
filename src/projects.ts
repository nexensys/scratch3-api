"use strict";

import { AnyObject } from "./defs.js";
import { getJSON } from "./request.js";
import UserSession from "./usersession.js";

/**
 * Project variable.
 * @typedef {Object} Variable
 * @property {string} id - The variable's blockly id.
 * @property {boolean} spriteOnly - Whether the variable is for that sprite only.
 */

/**
 * Project container class.
 * @param {Sprite} stage - The project's stage sprite.
 * @param {Object.<string, Variable>} variables - The project's variables.
 */
class Project {
  stage: Sprite;
  variables: AnyObject;
  spritenames: string[];
  sprites: Sprite[];

  constructor(d: AnyObject, desc: AnyObject) {
    Object.assign(this, desc);
    this.stage = new Sprite(
      d.targets.filter(function (s: AnyObject) {
        return s.isStage;
      })[0]
    );
    this.variables = {};
    let globalVars = Object.keys(
      d.targets.filter(function (s: AnyObject) {
        return s.isStage;
      })[0].variables
    ).map(function (k) {
      return d.targets.filter(function (s: AnyObject) {
        return s.isStage;
      })[0].variables[k];
    });
    let cloudVars = globalVars
      .filter(function (v) {
        return !!v[2];
      })
      .map(function (v) {
        return v[0];
      });

    for (let m of d.monitors) {
      if (m.id === "answer") continue;
      this.variables[m.params.VARIABLE || m.params.LIST] = {
        id: m.id,
        spriteOnly: !!m.spriteName,
        sprite: m.spriteName,
        value: m.value,
        type: m.mode === "default" ? "variable" : "list",
        isCloud: cloudVars.includes(m.params.VARIABLE || m.params.LIST)
      };
    }

    this.spritenames = d.targets.map(function (s: AnyObject) {
      return s.name;
    });
    this.sprites = [];

    for (let t of d.targets.filter(function (s: AnyObject) {
      return !s.isStage;
    })) {
      this.sprites.push(new Sprite(t));
    }
  }
}

class Sprite {
  variables: AnyObject;
  lists: AnyObject;
  broadcasts: string[];
  blocks: AnyObject[];
  comments: AnyObject[];
  isStage: boolean;
  name: string;
  costumes: AnyObject[];
  sounds: AnyObject[];
  volume: number;
  layer: number;

  constructor(d: AnyObject) {
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
  usersession: UserSession | string | undefined;
  constructor(u?: UserSession | string) {
    this.usersession = u;
  }

  async get(id: number | string) {
    return new Project(
      await getJSON({
        hostname: "projects.scratch.mit.edu",
        path: `/${id}`
      }),
      await getJSON({
        hostname: "api.scratch.mit.edu",
        path: `/projects/${id}`
      })
    );
  }

  async getUserProjects(limit: number = Infinity) {
    let t = this.usersession;
    if (!t) return null;
    let realp = [];
    for (let offset = 0; offset <= limit; offset += 40) {
      if (limit < 1 || Math.floor(limit) !== limit)
        throw new Error(
          `Error: Invalid project limit. The limit parameter must be ${
            limit < 1 ? "greater than or equal to 1" : "an integer"
          }.`
        );
      let p = await getJSON({
        hostname: "api.scratch.mit.edu",
        path: `/users/${
          typeof t === "object" ? t.username : t
        }/projects?limit=${
          typeof limit === "number" ? (limit > 40 ? 40 : limit) : 40
        }&offset=${offset}`
      });

      for (let project of p.map(function (i: AnyObject) {
        return i.id;
      })) {
        realp.push(await this.get(project));
      }

      if (p.length < 40) {
        break;
      }
    }

    return realp;
  }
}

export default Projects;

class ProjectsStatic {
  static async get(id: number) {
    return await new Projects().get(id);
  }

  static async getUserProjects(un: string, limit: number = Infinity) {
    return await new Projects(un).getUserProjects(limit);
  }
}

export { Projects, ProjectsStatic };
