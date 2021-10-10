"use strict";

import https from "https";
import { AnyObject, RequestResponse } from "./defs";

const request = async function (o: AnyObject): Promise<RequestResponse> {
  let h: AnyObject = {
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

  let p = new Promise<RequestResponse>(function (resolve) {
    let r = https.request(
      {
        hostname: o.hostname || "scratch.mit.edu",
        port: 443,
        path: o.path,
        method: o.method || "GET",
        headers: h
      },
      function (res) {
        let p: any[] = [];
        res.on("data", function (c) {
          return p.push(c);
        });
        res.on("end", function () {
          return resolve([null, Buffer.concat(p).toString(), res]);
        });
      }
    );

    r.on("error", resolve);

    if (o.body) {
      r.write(o.body);
    }

    r.end();
  });
  return await p;
};

const getJSON = async function (o: AnyObject): Promise<AnyObject | any[]> {
  let [, b] = await request(o);
  return JSON.parse(b);
};

export { request, getJSON };
