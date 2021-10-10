"use strict";

import { AnyObject } from "./defs.js";
import { getJSON } from "./request.js";

class Conference {
  async scheduleForDay(day: string | number, zidx: boolean = true) {
    let days = [
      "Saturday",
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday"
    ].map(function (day) {
      return day.toLowerCase();
    });

    let d = (function () {
      switch (typeof day) {
        case "string":
          if (days.includes(day)) {
            return day;
          } else {
            throw new Error("Invalid day of week");
          }

        case "number":
          if (Math.floor(day) !== day)
            throw new Error("Day of week must be an integer");

          if (zidx) {
            if (day < 6 && day >= 0) {
              return days[day];
            }

            throw new Error(`${day} is not a valid day of the week`);
          } else {
            if (day < 7 && day >= 1) {
              return days[day - 1];
            }

            throw new Error(`${day} is not a valid day of the week`);
          }
      }
    })();

    return await getJSON({
      hostname: "api.scratch.mit.edu",
      path: `/conference/schedule/${d}`
    });
  }

  async detailsFor(id: number | string) {
    return await getJSON({
      hostname: "api.scratch.mit.edu",
      path: `/conference/${id}/details`
    });
  }
}

class Users {
  async get(username: string) {
    return await getJSON({
      hostname: "api.scratch.mit.edu",
      path: `/users/${username}`
    });
  }

  async getFollowing(username: string) {
    let following: AnyObject[] = [];
    let offset = 0;

    while (true) {
      let batch = await getJSON({
        hostname: "api.scratch.mit.edu",
        path: `/users/${username}/following?limit=40&offset=${offset}`
      });
      following = following.concat(Array.isArray(batch) ? batch : []);

      if (batch.length < 40) {
        return following;
      }

      offset += 40;
    }
  }

  async getFollowers(username: string) {
    let followers: AnyObject[] = [];
    let offset = 0;

    while (true) {
      let batch = await getJSON({
        hostname: "api.scratch.mit.edu",
        path: `/users/${username}/followers?limit=40&offset=${offset}`
      });
      followers = followers.concat(batch);

      if (batch.length < 40) {
        return followers;
      }

      offset += 40;
    }
  }
}

const Rest = {
  Conference: new Conference(),
  Users: new Users(),
  getHealth: function () {
    return getJSON({
      hostname: "api.scratch.mit.edu",
      path: "/health"
    });
  },
  getNews: function () {
    return getJSON({
      hostname: "api.scratch.mit.edu",
      path: "/news"
    });
  }
};

export default Rest;
