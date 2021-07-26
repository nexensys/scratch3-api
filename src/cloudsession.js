"use strict";

import EventEmmitter from "events";
import WebSocket from "ws";
import s2n from "stringstonumbers";

/**
 * ClousSession API.
 * @extends EventEmitter
 * @property {UserSession} user - UserSession that the CloudSession was created with.
 * @property {number|string} id - The id of the project that the CloudSession is connecting to.
 */


class CloudSession extends EventEmitter {
  #connection = null
  #_variables = Object.create(null)
  variables = Object.create(null)
  attemptedPackets = []
  /**
   * @param {UserSession} user - The UserSession to create the CloudSession with.
   * @param {number|string} proj - The ID of the project to connect to.
   */
  constructor(user, proj, turbowarp = false) {
    super();
    this.user = user;
    this.id = proj;
    this.usetw = turbowarp;
  }
  /**
   * Create a new, connected CloudSession.
   * @async
   * @param {UserSession} user - The UserSession to create the CloudSession with.
   * @param {number|string} proj - The ID of the project to connect to.
   * @returns {Promise<CloudSession>}
   */


  static async create(user, proj, turbowarp) {
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
    this.#connection = new WebSocket(`wss://${this.usetw ? "clouddata.turbowarp.org" : "clouddata.scratch.mit.edu"}/`, [], {
      headers: {
        cookie: `${this.usetw ? "" : `scratchsessionsid=${this.user.sessionId}`};`,
        origin: "https://scratch.mit.edu"
      }
    });
    let self = this;
    let handshake = this.#sendHandshake;
    let sendPacket = this.#sendPacket;
    this.#connection.on("open", function () {
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
    this.#connection.on("close", function () {
      self.connect();
    });
    let s = "";

    let handlePacket = this.#handlePacket;
    if (!this.usetw) {
      this.#connection.on("message", function (c) {
        s += c;
        let p = s.split("\n");
        s = p.pop();

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
      this.#connection.on("message", function (p) {
        for (let m of p.split("\n")) {
          let t;

          try {
            t = JSON.parse(m);
          } catch {
            console.warn(`Invalid packet:\n${l}`);
            return;
          }

          handlePacket(t);
        }
      });
    }

    let connection = this.#connection;

    await new Promise(function (resolve) {
      connection.on("open", function () {
        self.emit("open");
        resolve();
      });
    });
    return;
  }
  /**
   * Ends the WebSocket connection.
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


  get(n) {
    return this._variables[n];
  }
  /**
   * Set a cloud variable in the project.
   * @param {string} n - The name of the variable.
   * @param {*} v - The value to set the variable to.
   */


  set(n, v) {
    if (isNaN(Number(v))) console.warn("Only number values can be stored in cloud variables.");
    this.#_variables[n] = v;

    this.#sendSet(n, v);
  }

  #handlePacket(p) {
    if (!p) return;
    let t;

    try {
      t = JSON.parse(p);
    } catch {
      t = p;
    }

    if (t.method === "set") {
      if (!{}.hasOwnProperty.call(this.variables, t.name)) {
        this.#addVariable(t.name, t.value);
      }

      this.#_variables[t.name] = t.value;
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

  #sendHandshake() {
    this.#send("handshake", {});
  }

  #sendSet(n, v) {
    this.#send("set", {
      name: n,
      value: v
    });
  }

  #send(m, o) {
    let t = {
      user: this.user.username,
      project_id: this.id,
      method: m
    };

    for (let op in o) {
      t[op] = o[op];
    }

    this.#sendPacket(JSON.stringify(t) + "\n");
  }

  #sendPacket(d) {
    if (this.connection.readyState === WebSocket.OPEN) {
      this.connection.send(d);
    } else {
      this.attemptedPackets.push(d);
    }
  }

  #addVariable(n, v) {
    let self = this;
    this._variables[n] = v;
    Object.defineProperty(this.variables, n, {
      enumerable: true,
      get: function () {
        return self.get(n);
      },
      set: function (val) {
        return self.set(n, val);
      }
    });
  }
  /**
   * Add the "☁" symbol to a name.
   * @param {string} n - The name of the variable.
   * @returns {string}
   */


  name(n) {
    return `☁ ${n}`;
  }

}

CloudSession.prototype.numerify = s2n.encode;
CloudSession.prototype.stringify = s2n.decode;

export default CloudSession;