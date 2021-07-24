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
  let cloud = await session.cloudSession("<project>");
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
**async `cloudSession(project, turbowarp)`**

Creates and connects a new `CloudSession` with the `UserSession`.

- `project` - The id of the project to connect to. Must be valid.
- `turbowarp` - Whether the WebSocket should connect to the Turbowarp cloud(`true`) or Scratch cloud(`false`).
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
**static `create(usersession, project, turbowarp)`**

Creates and connects a new `CloudSession` with the given `UserSession`.

- `usersession` - Required. The `UserSession` to create the `CloudSession` with.
- `project` - The id of the project to connect to. Must be valid.
- `turbowarp` - Whether the WebSocket should connect to the Turbowarp cloud(`true`) or Scratch cloud(`false`).
- `returns` a connected `CloudSession`.

---

<a name="csconstructor"></a>
**`constructor(usersession, project, turbowarp)`**

Creates a new, unconnected `CloudSession` with the given `UserSession`.

- `usersession` - Required. The `UserSession` to create the `CloudSession` with.
- `project` - The id of the project to connect to. Must be valid.
- `turbowarp` - Whether the WebSocket should connect to the Turbowarp cloud(`true`) or Scratch cloud(`false`).
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

When using turbowarp, if the variable has not been changed since the server has started, this will return `undefined` due to the slight difference between the two WebSocket servers.

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

Turns the encoded number input and converts it back to a string.

- `number` - The number to convert back to a string.
- `returns` a `String` matching the origionally encoded string.

---

<a name="csname"></a>
**`name(variable)`**

Automatically adds the `☁` to the variable name.

- `name` - The name of the variable (without `☁ `)
- `returns` `☁` + `variable`.

---

<a name="otherapis"></a>

### Other APIs

---

<a name="otherapisproject"></a>
**`Project`**

The `Project` class reformats a response from Scratch's project api into an easy-to-use object.

Each `Project` instance will be formatted like this:

- `stage` - A [`Sprite`](#otherapissprite) instance describing the project's stage.
- <a name="projectvars"></a>`variables` - An object containing all of the variables in the project. To retreive the names of these variables, use `Object.keys`.
  - `id` - A `String` containing the variable's id. This is not really of much use unless you are working with [Scratch Blocks](https://github.com/LLK/scratch-blocks).
  - `spriteOnly` - A `Boolean`. True if the variable has 'this sprite only' checked.
  - `sprite` - A `String` with the variable's parent sprite. `null` if `spriteOnly` is `false`.
  - `value` - A `String` or `Array` (if the variable is a list) containing the value of the variables. In the case of cloud variables this may not be accurate as this value is only saved when a project is saved.
  - `type` - A `String` containing the type of the variable, either `variable` or `list`.
  - `isCloud` - A `Boolean`. True if the variable is a cloud variable.
- `spritenames` - An `Array` of `String`s containing the names of all of the sprites in the project.
- `sprites` - An `Array` of [`Sprite`](#otherapissprite)s.

---

<a name="otherapissprite"></a>
**`Sprite`**

The `Sprite` class reformats the sprite objects in Scratch's project api's responses.

Each `Sprite` instance will be formatted like this:

- `variables` - See [`Project - variables`](#projectvars).
- `lists` - See [`Project - variables`](#projectvars).
- `broadcasts` - An `Array` of `String`s containing each of the project's broadcast messages.
- `blocks` - An `Array` containing the blocks in the `Sprite`'s workspace.
- `comments` - An `Array` containing the comments in the `Sprite`'s workspace.
- `isStage` - A `Boolean`. True if the `Sprite` is the stage.
- `name` - A `String` containing the `Sprite`'s name.
- `costumes` - An array of the `Sprite`'s costumes.
- `sounds` - An array of the `Sprite`'s sounds.
- `volume` - A `Number` containing the `Sprite`'s volume.
- `layer` - A `Number` containing the `Sprite`'s layer in the project.
