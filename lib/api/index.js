"use strict";

const {
  getJSON
} = require("../request");

class API {
  get conference() {
    return new Conference();
  }

  get users() {
    return new Users();
  }

}

class Conference {
  async scheduleForDay(day, zidx = true) {
    let days = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(function (day) {
      return day.toLowerCase();
    });

    let d = function () {
      switch (typeof day) {
        case "string":
          if (days.includes(day)) {
            return day;
          } else {
            throw new Error("Invalid day of week");
          }

        case "number":
          if (Math.floor(day) !== day) throw new Error("Day of week must be an integer");

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
    }();

    return await getJSON({
      hostname: "api.scratch.mit.edu",
      path: `/conference/schedule/${d}`
    });
  }

  async detailsFor(id) {
    return await getJSON({
      hostname: "api.scratch.mit.edu",
      path: `/conference/${id}/details`
    });
  }

}

class Users {
  async get(username) {
    return await getJSON({
      hostname: "api.scratch.mit.edu",
      path: `/users/${username}`
    });
  }

  async getFollowing(username) {
    let following = [];
    let offset = 0;

    while (true) {
      let batch = await getJSON({
        hostname: "api.scratch.mit.edu",
        path: `/users/${username}/following?limit=40&offset=${offset}`
      });
      following = following.concat(batch);

      if (batch.length < 40) {
        return following;
      }

      offset += 40;
    }
  }

  async getFollowers(username) {
    let followers = [];
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

module.exports = {
  conference: new Conference(),
  users: new Users()
};