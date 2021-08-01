"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getJSON = exports.request = void 0;

var _https = _interopRequireDefault(require("https"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const request = async function (o) {
  let h = {
    Cookie: "scratchcsrftoken=a; scratchlanguage=en;",
    "X-CSRFToken": "a",
    referer: "https://scratch.mit.edu"
  };

  if (typeof o === "object" && o && o.headers) {
    for (let p in o.headers) {
      h[p] = o.headers[p];
    }

    if (o.body) {
      h["Content-Length"] = Buffer.byteLength(o.body);
    }

    if (o.sessionId) {
      h.Cookie += "scratchsessionsid=" + o.sessionId + ";";
    }
  }

  let p = new Promise(function (resolve) {
    let r = _https.default.request({
      hostname: o.hostname || "scratch.mit.edu",
      port: 443,
      path: o.path,
      method: o.method || "GET",
      headers: h
    }, function (res) {
      let p = [];
      res.on("data", function (c) {
        return p.push(c);
      });
      res.on("end", function () {
        return resolve([null, Buffer.concat(p).toString(), res]);
      });
    });

    r.on("error", resolve);

    if (o.body) {
      r.write(o.body);
    }

    r.end();
  });
  return await p;
};

exports.request = request;

const getJSON = async function (o) {
  let [e, b, r] = await request(o);
  return JSON.parse(b);
};

exports.getJSON = getJSON;