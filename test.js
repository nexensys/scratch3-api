const Scratch = require("./api.js");

(async function () {
  let user = await Scratch.API.users.getFollowers("ErrorGamer2000");
  console.log(user.map((v) => v.username));
})();

("");
