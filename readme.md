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

## API Documentation

### Scratch

- [`UserSession`](#us)
  - static [`create`](#uscreate)
  - [`constructor`](#usconstructor)
  - [`load`](#usload)
  - [`prompt`]() (Deprecated)
  - [`verify`]()
  - [`projects`]()
  - [`comment`]()
  - [`cloudSession`]()
- [`CloudSession`]()
  - static [`create`]()
  - [`constructor`]()
  - [`connect`]()
  - [`end`]()
  - [`get`]()
  - [`set`]()
  - [`numerify`]()
  - [`stringify`]()
  - [`name`]()

<a name="us"></a>

#### UserSession

<a name="uscreate"></a>
**async static `create(username, password)`**

Creates and loads a new `UserSession` with the given username and password. If either is not provided the user will be prompted.

- `username` - The Scratch account username (not case sensitive).
- `password` - The Scratch account password.
- `returns` a loaded `Scratch.Usersession`.

Note that

```js
//Async
let session = await Scratch.UserSession.create("<username", "<password>");
```

is exactly the same as

```js
//Async
let session = new Scratch.UserSession();
await session.load("<username", "<password>");
```

<a name="usconstructor"></a>
**`constructor`**

Creates a new, unloaded, `Scratch.Usersession`.

No parameters.

<a name="usload"></a>
**async `load(username, password)`**
