"use strict";

import EventEmitter from "events";
import WebSocket from "ws";
import UserSession from "./usersession";
import { AnyObject } from "./defs";

/**
 * ClousSession API.
 * @extends EventEmitter
 * @property {UserSession} user - UserSession that the CloudSession was created with.
 * @property {number|string} id - The id of the project that the CloudSession is connecting to.
 * @property {object} variables - Project variables.
 */
class CloudSession extends EventEmitter {
  variables: AnyObject = {};
  _variables: AnyObject = {};
  attemptedPackets: string[] = [];
  user: UserSession;
  id: number;
  usetw: boolean;

  connection: WebSocket;

  /**
   * @param user - The UserSession to create the CloudSession with.
   * @param proj - The ID of the project to connect to.
   */
  constructor(
    user: UserSession,
    proj: number | string,
    turbowarp: boolean = false
  ) {
    super();
    this.user = user;
    this.id = Number(proj);
    this.usetw = turbowarp;
    this.connection = new WebSocket(
      `wss://${
        this.usetw ? "clouddata.turbowarp.org" : "clouddata.scratch.mit.edu"
      }/`,
      [],
      {
        headers: {
          cookie: `${
            this.usetw ? "" : `scratchsessionsid=${this.user.sessionId}`
          };`,
          origin: "https://scratch.mit.edu"
        }
      }
    );
    let self = this;
    let handshake = this.sendHandshake;
    let sendPacket = this.sendPacket;
    this.connection.on("open", function () {
      handshake();

      for (let packet of self.attemptedPackets) {
        sendPacket(packet);
      }

      self.attemptedPackets = [];
      /**
       * WebSocket connection was reset.
       * @event CloudSession#reset
       */

      self.emit("reset");
    });
    this.connection.on("close", function () {
      self.connect();
    });
    let s: string = "";

    let handlePacket = this.handlePacket;
    if (!this.usetw) {
      this.connection.on("message", function (c: string) {
        s += c;
        let p: string[] = s.split("\n");
        s = String(p.pop());

        for (let l of p) {
          let t;

          try {
            t = JSON.parse(l);
          } catch {
            console.warn(`Invalid packet:\n${l}`);
            return;
          }

          handlePacket(t);
        }
      });
    } else {
      this.connection.on("message", function (p: string) {
        for (let m of p.split("\n")) {
          let t;

          try {
            t = JSON.parse(m);
          } catch {
            console.warn(`Invalid packet!`);
            return;
          }

          handlePacket(t);
        }
      });
    }
  }

  private handlePacket(p: string): void {
    if (!p) return;
    let t;

    try {
      t = JSON.parse(p);
    } catch {
      t = p;
    }

    if (t.method === "set") {
      let isNew = !this.variables.hasOwnProperty(t.name);
      if (isNew) {
        this.addVariable(t.name, t.value);
        this.emit("addvariable", t.name, t.value);
      }

      this._variables[t.name] = t.value;
      /**
       * A cloud variable was set by a user.
       * @event CloudSession#set
       * @property {string} name - The name of the variable that was set.
       * @property {string} value - The value of the variable.
       */

      this.emit("set", t.name, t.value);
    } else {
      console.warn(`Unimplemented packet: ${t}`);
    }
  }

  private sendHandshake() {
    this.send("handshake", {});
  }

  private sendSet(n: string, v: number | string) {
    this.send("set", {
      name: n,
      value: v
    });
  }

  private send(m: string, o: { [index: string]: any } = {}) {
    let t: { [index: string]: any } = {
      user: this.user.username,
      project_id: this.id,
      method: m
    };

    for (let op in o) {
      t[op] = o[op];
    }

    this.sendPacket(JSON.stringify(t) + "\n");
  }
  private sendPacket(d: string) {
    if (this.connection.readyState === WebSocket.OPEN) {
      this.connection.send(d);
    } else {
      this.attemptedPackets.push(d);
    }
  }

  private addVariable(n: string, v: string | number) {
    let self = this;
    this._variables[n] = v;
    Object.defineProperty(this.variables, n, {
      get: function () {
        return self.get(n);
      },
      set: function (val) {
        return self.set(n, val);
      }
    });
  }

  /**
   * Create a new, connected CloudSession.
   * @async
   * @param {UserSession} user - The UserSession to create the CloudSession with.
   * @param {number|string} proj - The ID of the project to connect to.
   * @returns {CloudSession} A loaded CloudSession.
   */
  static async create(
    user: UserSession,
    proj: number | string,
    turbowarp: boolean
  ) {
    let s = new CloudSession(user, proj, turbowarp);
    await s.connect();
    return s;
  }

  /**
   * Connect the CloudSession to the Scratch Server.
   * @fires CloudSession#reset
   * @fires CloudSession#set
   */
  async connect() {
    const self = this;
    let connection = this.connection;

    await new Promise<void>(function (resolve) {
      connection.on("open", function () {
        self.emit("open");
        resolve();
      });
    });
  }

  /**
   * End the WebSocket connection.
   */
  end() {
    if (this.connection) {
      this.connection.close();
    }
  }

  /**
   * Get the value of a variable.
   * @param {string} n - The name of the variable.
   * @returns {string} The variable's value.
   */
  get(n: string): number | string {
    return this._variables[n];
  }

  /**
   * Set a cloud variable in the project.
   * @param {string} n - The name of the variable.
   * @param {number|string} v - The value to set the variable to.
   */
  set(n: string, v: number) {
    if (isNaN(Number(v)))
      console.warn("Only number values can be stored in cloud variables.");
    this._variables[n] = v;

    this.sendSet(n, v);
  }

  /**
   * Add the "☁" symbol to a name.
   * @param {string} n - The name of the variable.
   * @returns {string}
   */
  name(n: string): string {
    return `☁ ${n}`;
  }

  /**
   * Convert a string to a sequence of numbers that can be stored in a cloud variable.
   * @param {string} [s=""] - The string to convert.
   * @returns {string} A sequence of numbers representing the input string.
   */
  numerifyencode(str: string = ""): string {
    const chars: string =
      "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!#$%()*+,-./\\:;=?@[]^_`{|}~\"'&<> ";
    let r: string = "";
    for (let l of String(str)) {
      if (chars.indexOf(l) < 0) {
        r += String(chars.length + 1);
        continue;
      }
      r +=
        chars.indexOf(l) + 1 < 10
          ? `0${chars.indexOf(l) + 1}`
          : `${chars.indexOf(l) + 1}`;
    }
    return `${r}00`;
  }

  /**
   * Cinvert a sequence of numbers into the represented string.
   * @param {string|number} [n=""] - The number to convert.
   * @param {number} l - The letter of the input number to start the conversion at.
   * @returns {string} The converted string.
   */
  stringify(num: number | string, startLetter: number = 0): string {
    const chars: string =
      "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!#$%()*+,-./\\:;=?@[]^_`{|}~\"'&<> ";
    let r: string = "";
    let t: any | null[] = String(num)
      .slice(startLetter)
      .match(/[0-9][0-9]?/g);
    for (let c of t) {
      if (c === "00") {
        return r;
      }
      if (c > chars.length) {
        continue;
      }
      r += chars[c - 1];
    }
    return r;
  }
}

export default CloudSession;
