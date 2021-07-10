"use strict";

const { EventEmitter } = require("events");

const WebSocket = require("ws"),
  s2n = require("stringstonumbers");
/**
 * ClousSession API.
 * @extends EventEmitter
 * @property {UserSession} user - UserSession that the CloudSession was created with.
 * @property {number|string} id - The id of the project that the CloudSession is connecting to.
 * @property {WebSocket} connection - WebSocket connection that is used.
 */

class CloudSession extends EventEmitter {
  /**
   * @param {UserSession} user - The UserSession to create the CloudSession with.
   * @param {number|string} proj - The ID of the project to connect to.
   */
  constructor(user, proj, turbowarp = false) {
    super();
    this.user = user;
    this.id = proj;
    this.usetw = turbowarp;
    this.connection = null;
    this.attemptedPackets = [];
    this.variables = Object.create(null);
    this._variables = Object.create(null);
  }
  /**
   * Create a new, connected CloudSession.
   * @async
   * @param {UserSession} user - The UserSession to create the CloudSession with.
   * @param {number|string} proj - The ID of the project to connect to.
   * @returns {Promise<CloudSession>}
   */

  static async create(user, proj, turbowarp) {
    let s = new this(user, proj, turbowarp);
    await s.connect();
    return s;
  }
  /**
   * Connect the CloudSession to the Scratch Server.
   * @fires CloudSession#reset
   * @fires CloudSession#set
   */

  async connect() {
    var _this = this;

    this.connection = new WebSocket(
      `wss://${
        this.usetw ? "clouddata.turbowarp.org" : "clouddata.scratch.mit.edu"
      }/`,
      [],
      {
        headers: {
          cookie: `scratchsessionsid=${this.user.sessionId};`,
          origin: "https://scratch.mit.edu"
        }
      }
    );
    let self = this;
    this.connection.on("open", function () {
      self._sendHandshake();

      for (let packet of self.attemptedPackets) {
        self._sendPacket(packet);
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
    let s = "";
    this.connection.on("message", function (c) {
      s += c;
      let p = s.split("\n");
      s = p.pop();

      for (let l of p) {
        let t;

        try {
          t = JSON.parse(l);
        } catch {
          console.warn(`Invalid packet:\n${l}`);
        }

        self._handlePacket(t);
      }
    });
    await new Promise(function (resolve) {
      _this.connection.on("open", resolve);
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
    if (!Number(v))
      console.warn("Only number values can be stored in cloud variables.");
    this._variables[n] = v;

    this._sendSet(n, v);
  }

  _handlePacket(p) {
    if (!p) return;
    let t;

    try {
      t = JSON.parse(p);
    } catch {
      t = p;
    }

    if (t.method === "set") {
      if (!{}.hasOwnProperty.call(this.variables, t.name)) {
        this._addVariable(t.name, t.value);
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

  _sendHandshake() {
    this._send("handshake", {});
  }

  _sendSet(n, v) {
    this._send("set", {
      name: n,
      value: v
    });
  }

  _send(m, o) {
    let t = {
      user: this.user.username,
      project_id: this.id,
      method: m
    };

    for (let op in o) {
      t[op] = o[op];
    }

    this._sendPacket(JSON.stringify(t) + "\n");
  }

  _sendPacket(d) {
    if (this.connection.readyState === WebSocket.OPEN) {
      this.connection.send(d);
    } else {
      this.attemptedPackets.push(d);
    }
  }

  _addVariable(n, v) {
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

Object.defineProperties(CloudSession.prototype, {
  numerify: {
    value: s2n.encode,
    enumerable: false,
    writable: false
  },
  stringify: {
    value: s2n.decode,
    enumerable: false,
    writable: false
  }
});
module.exports = CloudSession;
