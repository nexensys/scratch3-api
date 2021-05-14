# scratch3-api

A remake of [trumank's scratch-api](https://www.npmjs.com/package/scratch-api) optimized for scratch 3.0. It not only adds to the api, but is also composed mostly of promises to prevent [callback hell](http://callbackhell.com/). So, instead of

```js
const Scratch = require("scratch-api");

Scratch.UserSession.create("<username>", "<password>", function (err, user) {
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
  let session = await Scratch.UserSession.create("<username>", "<password>");
  let cloud = session.cloudSession("<project>");
  cloud.on("set", function (name, value) {
    console.log(`${name} was set to ${value}`);
  });
}

main();
```

which is a lot easier to read. If, for some reason, you _like_ callback hell, you can just use `.then()`.

```js
const Scratch = require("scratch3-api");

Scratch.UserSession.create("<username>", "<password>").then(function (session) {
  session.cloudSession("<project>").then(function (cloud) {
    cloud.on("set", function (name, value) {
      console.log(`${name} was set to ${value}`);
    });
  });
});
```

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
  - [Events](#usevents)
  - static [`create`](#uscreate)
  - [`constructor`](#usconstructor)
  - [`load`](#usload)
  - [`prompt`](#usprompt) (Deprecated)
  - [`verify`](#usverify)
  - [`comment`](#uscomment)
  - [`projects`](#usprojects)
    - [`get`](#usprojectsget)
    - [`getUserProjects`](#usprojectsgetuserprojects)
  - [`cloudSession`](#uscloudsession)
- [`CloudSession`](#cs)
  - [Events](#csevents)
  - static [`create`](#cscreate)
  - [`constructor`](#csconstructor)
  - [`connect`](#csconnect)
  - [`end`](#csend)
  - [`get`](#csget)
  - [`set`](#csset)
  - [`numerify`](#csnumerify)
  - [`stringify`](#csstringify)
  - [`name`](#csname)
- [`Other APIs`](#otherapis)
  - [`Project`](#otherapisproject)
  - [`Sprite`](#otherapissprite)

---

<a name="us"></a>

### UserSession

---

<a name="usevents"></a>
**Events**

None.

---

<a name="uscreate"></a>
**async static `create(username, password)`**

Creates and loads a new `UserSession` with the given `username` and `password`.

- `username` - The Scratch account username (not case sensitive). Optional. If not provided user will be prompted.
- `password` - The Scratch account password. Optional. If not provided user will be prompted.
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

---

<a name="usconstructor"></a>
**`constructor()`**

Creates a new, unloaded, `Scratch.Usersession`.

- `returns` an unloaded `Scratch.Usersession`.

---

<a name="usload"></a>
**async `load(username, password)`**

Loads a `UserSession` with the given `username` and `password`.

- `username` - The Scratch account username (not case sensitive). Optional. If not provided user will be prompted.
- `password` - The Scratch account password. Optional. If not provided user will be prompted.
- `returns` none.

---

<a name="usprompt"></a>
**async `prompt()`** (Deprecated)

Prompts the user for their username and password.

- `returns` an unloaded `Scratch.Usersession`.

This feature will lose support soon, instead use `.load` with no parameters.

---

<a name="usverify"></a>
**async `verify()`**

Verifies the current session.

- `returns` `true` of `false`

---

<a name="uscomment"></a>
**async `comments(options)`**

Adds a comment on the specified project, user, or studio.

- `options` - An object containing the comments options.
  - `project`, `user`, or `studio` - The project, user, or studio to comment on. User must be a username and the others must be ids.
  - `parent` - The comment id to reply to. Optional.
  - `replyto` - The user id to address (@username ...). Optional.
  - `content` - The text of the comment to post.
- `returns` an `https` request.

---

<a name="usprojects"></a>
**`projects`**

<a name="usprojectsget"></a>

- **async `get(id)`** Gets a project with the given id.
  - `id` - The id of the project to get.
  - `returns` `Project`. (see [`Other APIs`](#otherapis))

<a name="usprojectsgetuserprojects"></a>

- **async `getUserProjects(limit)`** Gets up to 40 projects of the currently logged in user.
  - `limit` - A number from 1 to 40. The maximum amount of the user's projects to get.
  - `returns` an `Array` of `Project`s.

---

<a name="uscloudsession"></a>
**async `cloudSession(project)`**

Creates and connects a new `CloudSession` with the `UserSession`.

- `project` - The id of the project to connect to. Must be valid.
- `returns` a connected `CloudSession`

<a name="cs"></a>

### CloudSession

- `extends` EventEmitter

---

<a name="csevents"></a>
**Events**

- `reset` - The `WebSocket` connection was reset.
- `set` - A cloud variable in the project was set.

---

<a name="cscreate"></a>
**static `create(usersession, project)`**

Creates and connects a new `CloudSession` with the given `UserSession`.

- `usersession` - Required. The `UserSession` to create the `CloudSession` with.
- `project` - The id of the project to connect to. Must be valid.
- `returns` a connected `CloudSession`.

---

<a name="csconstructor"></a>
**`constructor(usersession, project)`**

Creates a new, unconnected `CloudSession` with the given `UserSession`.

- `usersession` - Required. The `UserSession` to create the `CloudSession` with.
- `project` - The id of the project to connect to. Must be valid.
- `returns` an unconnected `CloudSession`.

---

<a name="csconnect"></a>
**`connect()`**

Connects an unconnected `CloudSession`.

---

<a name="csend"></a>
**`end()`**

Ends the current connection.

---

<a name="csget"></a>
**`get(variable)`**

Gets the value of a cloud variable.

- `variable` - The name of the variable to get (including the `☁ `, see [`name`](#csname)).
- `returns` a `String` containing the value of the variable.

---

<a name="csset"></a>
**`set(variable, value)`**

Sets the value of a cloud variable.

- `variable` - The name of the variable to get (including the `☁ `, see [`name`](#csname)).
- `value` - The value to set the variable to. Can only be a number or a string that is a valid number.

---

<a name="csnumerify"></a>
**`numerify(string)`**

Turns the string input into a number, allowing you to send any value across the cloud variables. The compatible scratch engine is [here](https://scratch.mit.edu/projects/517845853/)

- `string` - The string to convert to an number.
- `returns` a `Number` representing the numerified string.

---

<a name="csstringify"></a>
**`stringify(number)`**

...Unfinished
