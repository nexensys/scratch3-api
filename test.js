const Scratch = require("./api.js");

(async function () {
  let user = await Scratch.API.users.get("ErrorGamer2000-Bot");
  console.log(user);
})();

("");
