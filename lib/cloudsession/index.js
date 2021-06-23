"use strict";

const {
  EventEmitter
} = require("events"),
      WebSocket = require("ws"),
      s2n = require("stringstonumbers");

class CloudSession extends EventEmitter {
  constructor(user, proj) {
    super();
    this.user = user;
    this.id = proj;
    this.connection = null;
    this.attemptedPackets = [];
    this.variables = Object.create(null);
    this._variables = Object.create(null);
  }

  static async create(user, proj) {
    let s = new this(user, proj);
    await s.connect();
    return s;
  }

  async connect() {
    var _this = this;

    this.connection = new WebSocket("wss://clouddata.scratch.mit.edu/", [], {
      headers: {
        cookie: `scratchsessionsid=${this.user.sessionId};`,
        origin: "https://scratch.mit.edu"
      }
    });
    let self = this;
    this.connection.on("open", function () {
      self._sendHandshake();

      for (let packet of self.attemptedPackets) {
        self._sendPacket(packet);
      }

      self.attemptedPackets = [];
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

  end() {
    if (this.connection) {
      this.connection.close();
    }
  }

  get(n) {
    return this._variables[n];
  }

  set(n, v) {
    if (!Number(v)) console.warn("Only number values can be stored in cloud variables.");
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