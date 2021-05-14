"use strict";

const https = require("https"),
  prompt = require("prompt"),
  util = require("util"),
  CloudSession = require("../cloudsession"),
  Projects = require("../projects");

const { request, getJSON } = require("../request");

const parse = function (cookie) {
  let c = {};
  let e = cookie.split(";");

  for (let p of e) {
    if (p.indexOf("=") === -1) {
      continue;
    }

    let s = p.split("=");
    c[s[0].trim()] = s[1].trim();
  }

  return c;
};

class UserSession {
  constructor() {
    this.loaded = false;
    this.valid = false;
  }

  static create(...a) {
    let s = new this();
    s.load(...a);
    return s;
  }

  get projects() {
    return new Projects(this);
  }

  async load(username, password) {
    if (username && password) {
      this.username = username;
      this.password = password;
    } else {
      prompt.start();
      let r = await new Promise(function (resolve, reject) {
        prompt.get(
          [
            {
              name: "Username",
              required: true,
            },
            {
              name: "Password",
              required: true,
              hidden: true,
              replace: "•",
            },
          ],
          function (e, r) {
            if (e) reject(e);
            else resolve(r);
          }
        );
      });
      this.username = r.Username;
      this.password = r.Password;
    }

    let [err, body, res] = await request({
      path: "/login/",
      method: "POST",
      body: JSON.stringify({
        username: this.username,
        password: this.password,
      }),
      headers: {
        "X-Requested-With": "XMLHttpRequest",
      },
    });
    if (err) throw new Error(err);

    try {
      let u = JSON.parse(body)[0];
      if (u.msg) throw new Error(u.msg);
      this.id = u.id;
      this.sessionId = parse(res.headers["set-cookie"][0]).scratchsessionsid;
      this.loaded = true;
      this.token = u.token;
      return;
    } catch (e) {
      if (e instanceof SyntaxError)
        throw new Error("Scratch servers are down. Try again later.");
      throw new Error(e);
    }
  }

  async prompt() {
    await new Promise(function (resolve) {
      return setTimeout(resolve, 0);
    }); //Allow deprecation warning to show before prompt

    return await this.load();
  }

  async verify() {
    let [e, body, res] = await request({});
    this.valid = !e && res.statusCode === 200;
    return this.valid;
  }

  async comment(o) {
    if (!this.valid) {
      await this.verify();
    }

    let t, id;

    if (o.project) {
      t = "project";
      id = o.project;
    } else if (o.user) {
      t = "user";
      id = o.user;
    } else if (o.studio) {
      t = "gallery";
      id = o.studio;
    }

    return await request({
      hostname: "scratch.mit.edu",
      headers: {
        referer: `https://scratch.mit.edu/users/${this.username}`,
        "X-Requested-With": "XMLHttpRequest",
        "x-csrftoken": "a",
        Cookie: `scratchcsrftoken=a;scratchlanguage=en;scratchsessionsid=${this.sessionId};`,
      },
      path: "/site-api/comments/" + t + "/" + id + "/add/",
      method: "POST",
      body: JSON.stringify({
        content: o.content,
        parent_id: o.parent || "",
        commentee_id: o.replyto || "",
      }),
      sessionId: this.sessionId,
    });
  }

  async cloudSession(proj) {
    return await CloudSession.create(this, proj);
  }
}

UserSession.prototype.prompt = util.deprecate(
  UserSession.prototype.prompt,
  "<UserSession>.prompt is deprecated. Use <UserSession>.load without parameters instead."
);
module.exports = UserSession;
