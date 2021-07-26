"use strict";

import EventEmitter from "events";
import WebSocket from "ws";

const privateProps = {
  connection: new WeakMap(),
  variables: new WeakMap(),
  handlePacket: new WeakMap(),
  sendHandshake: new WeakMap(),
  sendSet: new WeakMap(),
  send: new WeakMap(),
  sendPacket: new WeakMap(),
  addVariable: new WeakMap()
};

/**
 * ClousSession API.
 * @extends EventEmitter
 * @property {UserSession} user - UserSession that the CloudSession was created with.
 * @property {number|string} id - The id of the project that the CloudSession is connecting to.
 * @property {object} variables - Project variables.
 */
class CloudSession extends EventEmitter {
  variables = {};
  attemptedPackets = [];

  /**
   * @param {UserSession} user - The UserSession to create the CloudSession with.
   * @param {number|string} proj - The ID of the project to connect to.
   */
  constructor(user, proj, turbowarp = false) {
    super();
    this.user = user;
    this.id = proj;
    this.usetw = turbowarp;
    privateProps.connection.set(this, null);
    privateProps.variables.set(this, Object.create(null));
    privateProps.handlePacket.set(
      this,
      function handlePacket(p) {
        if (!p) return;
        let t;

        try {
          t = JSON.parse(p);
        } catch {
          t = p;
        }

        if (t.method === "set") {
          if (!this.variables.hasOwnProperty(t.name)) {
            privateProps.addVariable.get(this)(t.name, t.value);
          }

          privateProps.variables.get(this)[t.name] = t.value;
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
      }.bind(this)
    );
    privateProps.sendHandshake.set(
      this,
      function sendHandshake() {
        privateProps.send.get(this)("handshake", {});
      }.bind(this)
    );
    privateProps.sendSet.set(
      this,
      function sendSet(n, v) {
        privateProps.send.get(this)("set", {
          name: n,
          value: v
        });
      }.bind(this)
    );
    privateProps.send.set(
      this,
      function send(m, o) {
        let t = {
          user: this.user.username,
          project_id: this.id,
          method: m
        };

        for (let op in o) {
          t[op] = o[op];
        }

        privateProps.sendPacket.get(this)(JSON.stringify(t) + "\n");
      }.bind(this)
    );
    privateProps.sendPacket.set(
      this,
      function sendPacket(d) {
        if (privateProps.connection.get(this).readyState === WebSocket.OPEN) {
          privateProps.connection.get(this).send(d);
        } else {
          this.attemptedPackets.push(d);
        }
      }.bind(this)
    );
    privateProps.addVariable.set(
      this,
      function addVariable(n, v) {
        let self = this;
        privateProps.variables.get(this)[n] = v;
        Object.defineProperty(this.variables, n, {
          get: function () {
            return self.get(n);
          },
          set: function (val) {
            return self.set(n, val);
          }
        });
      }.bind(this)
    );
  }

  /**
   * Create a new, connected CloudSession.
   * @async
   * @param {UserSession} user - The UserSession to create the CloudSession with.
   * @param {number|string} proj - The ID of the project to connect to.
   * @returns {CloudSession} A loaded CloudSession.
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
    privateProps.connection.set(
      this,
      new WebSocket(
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
      )
    );
    let self = this;
    let handshake = privateProps.sendHandshake.get(this);
    let sendPacket = privateProps.sendPacket.get(this);
    privateProps.connection.get(this).on("open", function () {
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
    privateProps.connection.get(this).on("close", function () {
      self.connect();
    });
    let s = "";

    let handlePacket = privateProps.handlePacket.get(this);
    if (!this.usetw) {
      privateProps.connection.get(this).on("message", function (c) {
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
      privateProps.connection.get(this).on("message", function (p) {
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

    let connection = privateProps.connection.get(this);

    await new Promise(function (resolve) {
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
    if (privateProps.connection.get(this)) {
      privateProps.connection.get(this).close();
    }
  }

  /**
   * Get the value of a variable.
   * @param {string} n - The name of the variable.
   * @returns {string} The variable's value.
   */
  get(n) {
    return privateProps.variables.get(this)[n];
  }

  /**
   * Set a cloud variable in the project.
   * @param {string} n - The name of the variable.
   * @param {*} v - The value to set the variable to.
   */
  set(n, v) {
    if (isNaN(Number(v)))
      console.warn("Only number values can be stored in cloud variables.");
    privateProps.variables.get(this)[n] = v;

    privateProps.sendSet.get(this)(n, v);
  }

  /**
   * Add the "☁" symbol to a name.
   * @param {string} n - The name of the variable.
   * @returns {string}
   */
  name(n) {
    return `☁ ${n}`;
  }

  /**
   * Convert a string to a sequence of numbers that can be stored in a cloud variable.
   * @param {string} [s=""] - The string to convert.
   * @returns {string} A sequence of numbers representing the input string.
   */
  numerify(s = "") {
    const chars =
      "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!#$%()*+,-./\\:;=?@[]^_`{|}~\"'&<> ";
    let r = "";
    for (let l of String(s)) {
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
  stringify(n = "", l = 0) {
    const chars =
      "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!#$%()*+,-./\\:;=?@[]^_`{|}~\"'&<> ";
    let r = "";
    let t = String(n)
      .slice(l)
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
