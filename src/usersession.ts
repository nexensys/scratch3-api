"use strict";

import prompt from "prompt";
import util from "util";
import CloudSession from "./cloudsession.js";
import Projects from "./projects.js";
import { request } from "./request.js";
import { AnyObject } from "./defs.js";

const parse = function (cookie: string): AnyObject {
  let c: AnyObject = {};
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
/**
 * UserSession API for managing user data.
 * @param {boolean} loaded - whether or not a username and password have been loaded into the session.
 * @param {boolean} valid - the login was sucessful and accepted by the scratch servers.
 */

class UserSession {
  loaded: boolean;
  valid: boolean;
  sessionId: string = "";
  username: string = "";
  password: string = "";
  id: number = 0;
  token: string = "";
  /**
   * Create a blank UserSession
   */
  constructor() {
    this.loaded = false;
    this.valid = false;
  }

  /**
   * Create a new UserSession with the given username and password.
   * @async
   * @param  {string} [username] - The username to log in with. If missing user will be prompted.
   * @param  {string} [password] - The password to log in with. If missing user will be prompted.
   * @returns {UserSession} - A loaded UserSession.
   */
  static async create(username: string, password: string) {
    let s = new this();
    await s.load(username, password);
    return s;
  }
  /**
   * Acess Projects API.
   * @returns {Projects} - Project API
   */

  get projects() {
    return new Projects(this);
  }

  /**
   * Load a blank UserSession with the given username and password.
   * @async
   * @param  {string} [username] - The username to log in with. If missing user will be prompted.
   * @param  {string} [password] - The password to log in with. If missing user will be prompted.
   */
  async load(username: string = "", password: string = "") {
    if (this.loaded) return;
    let un = username,
      pw = password;

    if (!username) {
      prompt.start();

      let r = await new Promise<AnyObject>(function (resolve, reject) {
        prompt.get(
          [
            {
              name: "Username",
              required: true
            }
          ],
          function (e, r) {
            if (e) reject(e);
            else resolve(r);
          }
        );
      });
      un = r.Username;
    }

    this.username = un;

    if (!password) {
      prompt.start();

      let r = await new Promise<AnyObject>(function (resolve, reject) {
        prompt.get(
          [
            {
              name: "Password",
              required: true
            }
          ],
          function (e, r) {
            if (e) reject(e);
            else resolve(r);
          }
        );
      });
      pw = r.Password;
    }

    this.password = pw;
    let [err, body, res] = await request({
      path: "/login/",
      method: "POST",
      body: JSON.stringify({
        username: this.username,
        password: this.password
      }),
      headers: {
        "X-Requested-With": "XMLHttpRequest"
      }
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
    } catch (e: any) {
      if (e instanceof SyntaxError)
        throw new Error("Scratch servers are down. Try again later.");
      throw new Error(e);
    }
  }

  /**
   * Prompt the user for a username amnd password to load the UserSession with
   * @async
   */
  async prompt() {
    await new Promise(function (resolve) {
      return setTimeout(resolve, 0);
    }); //Allow deprecation warning to show before prompt

    return await this.load();
  }

  /**
   * Verify the loaded UserSession
   * @returns {boolean} Whether the session is valid or not
   */
  async verify() {
    let [e, body, res] = await request({});
    this.valid = !e && res.statusCode === 200;
    return this.valid;
  }

  /**
   * Add a comment
   * @async
   * @param {Object} o - Options
   * @param {string|number} [o.project] - Project to comment on. Overrides user and studio properties.
   * @param {string} [o.user] - User to comment on. Overrides studio property.
   * @param {string|number} [o.studio] - Studio to comment on.
   * @param {string|number} [o.parent] - Comment to reply to.
   * @param {string} [o.replyto] - The user id to address (@username ...).
   * @param {string} [o.content=""] - The text of the comment to post.
   */
  async comment(o: AnyObject) {
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

    await request({
      hostname: "scratch.mit.edu",
      headers: {
        referer: `https://scratch.mit.edu/users/${this.username}`,
        "X-Requested-With": "XMLHttpRequest",
        "x-csrftoken": "a",
        Cookie: `scratchcsrftoken=a;scratchlanguage=en;scratchsessionsid=${this.sessionId};`
      },
      path: "/site-api/comments/" + t + "/" + id + "/add/",
      method: "POST",
      body: JSON.stringify({
        content: o.content,
        parent_id: o.parent || "",
        commentee_id: o.replyto || ""
      }),
      sessionId: this.sessionId
    });
  }

  /**
   * Create a new CloudSession with the current UserSession.
   * @param {string|number} proj - ID of the project to connect to.
   * @returns {CloudSession} A loaded CloudSession.
   */
  async cloudSession(proj: number | string, turbowarp: boolean = false) {
    return await CloudSession.create(this, proj, turbowarp);
  }
}

UserSession.prototype.prompt = util.deprecate(
  UserSession.prototype.prompt,
  "<UserSession>.prompt is deprecated. Use <UserSession>.load without parameters instead."
);

export default UserSession;
