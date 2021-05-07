# scratch3-api

A remake of [trumank's scratch-api](https://www.npmjs.com/package/scratch-api) optimized for scratch 3.0. It not only adds to the api, but is also composed mostly of promises to prevent [callback hell](http://callbackhell.com/). So, instead of

```js
const Scratch = require("scratch-api");

Scratch.UserSession.load(function (err, user) {
  user.cloudSession("<project>", function (err, cloud) {
    cloud.on("set", function (name, value) {
      console.log(`${name} was set to ${value}`);
    });
  });
});
```

you can do

```js
const Scratch = require("scratch3-api");

async function main() {
  let user = new Scratch.UserSession();
  await user.load("<username>", "<password>");
  let cloud = user.cloudSession("<project>");
  await cloud.connect();
  cloud.on("set", (name, value) => {
    console.log(`${name} was set to ${value}`);
  });
}

main();
```

which is a lot easier to read.

## Installation

Install with npm:

```sh
npm install scratch3-api
```

Or by cloning this repository:

```sh
git clone https://github.com/ErrorGamer2000/scratch3-api.git
```