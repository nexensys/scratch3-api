# scratch3-api

> ### Now Supporting [Turbowarp](https://turbowarp.org)!

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

> Requires Node.js >= 10

Install with npm:

```sh
npm install scratch3-api
```

Or yarn:

```sh
yarn add scratch3-api
```

Or by cloning this repository:

```sh
git clone https://github.com/ErrorGamer2000/scratch3-api.git
```

## Adding to your script

### CommonJS

```js
const Scratch = require("scratch3-api");
// or
const { UserSession, CloudSession, Projects, Rest } = require("scratch3-api");
```

### ESM

```js
import Scratch from "scratch3-api";
// or
import { UserSession, CloudSession, Projects, Rest } from "scratch3-api";
```

## API Documentation

- [`UserSession`](#usersession-api)
- [`CloudSession`](#cloudsession-api)
- [`Projects`](#projects-api)
- [`Rest`](#rest-api)
- [`Other APIs`](#other-apis)
  - [`Project`](#project-api)
  - [`Sprite`](#sprite-api)
- [Credits](#contributors)

## UserSession API

The `UserSession` api handles the login and verification that makes the package to work. (Stored in the `session` variable for examples)

### Methods

---

#### Static Methods

- `create([username], [password])`

  - Creates and loads a new UserSession with the given username and password.
  - `username` - The Scratch account username (not case sensitive). Optional. If not provided user will be prompted.
  - `password` - The Scratch account password. Optional. If not provided user will be prompted.
  - `returns`: `Promise.<UserSession>`
       <!--- For some reason this is needed to keep code from overlapping last bullet --->
    <p />

  ```js
  let session = await Scratch.UserSession.create("<username", "<password>");

  //Could also be done with
  let session = new Scratch.UserSession();
  await session.load("<username", "<password>");
  ```

- `constructor()`

  - Creates a blank, unloaded `UserSession`.
  - `returns`: `UserSession`
    <p />

  ```js
  let session = new Scratch.UserSession();
  ```

#### Instance Methods

- `load([username], [password])`

  - Loads the `UserSession` instance with the given name and password.
  - `username` - The Scratch account username (not case sensitive). Optional. If not provided user will be prompted.
  - `password` - The Scratch account password. Optional. If not provided user will be prompted.
  - `returns`: `Promise.<undefined>`
    <p />

  ```js
  await session.load("<username", "<password>");
  ```

- `prompt()`

  > ⚠ Deprecated! This feature will be removed soon. Please use `<UserSession>.load` without parameters instead.

  - Prompts the user for their username and password then loads the `UserSession`.
  - `returns`: `Promise.<undefined>`
    <p />

  ```js
  await session.prompt();
  ```

- `verify()`

  - Validates the `UserSession`'s login.
  - `returns`: `Promise.<Boolean>`
    <p />

  ```js
  const valid = await session.verify();
  ```

- `comment(options)`

  - Validates the `UserSession`'s login.
  - `options`
    - `project`, `user`, or `studio` - The project, user, or studio to comment on. User must be a username and the others must be ids.
    - `parent` - The comment id to reply to. Optional.
    - `replyto` - The user id to address (@username ...). Optional.
    - `content` - The text of the comment to post.
  - `returns`: `Promise.<undefined>`
    <p />

  ```js
  await session.comment({
    project: 517845853,
    content: "Commented from Node.js with scratch3-api!"
  });
  ```

- `cloudSession(proj, [turbowarp = false])` - Create a new [`CloudSession`](#cloudsession-api) for the given project with the current `UserSession` and connects it. - `proj` - The id of the project to connect to. Can be a string or number. - `turbowarp` - Whether or not to connect to the [turbowarp](https://turbowarp.org) cloud servers instead of the scratch cloud servers. - `returns`: `Promise.<CloudSession>`
  <p />
  ```js
  		let cloud = await session.cloudSession(60917032);
  ```

### Instance Properties

- `get` `projects` - Returns a new instance of the [`Projects`](#projects-api) api.
- `loaded` - A boolean describing whether or not the session has been loaded with a username and password.
- `valid` - A boolean describing whether or not the session is valid.
- `username` - The username that the session was loaded with. Will not be defined if the `load()` method has not been called.
- `password` - The password that the session was loaded with. Will not be defined if the `load()` method has not been called.
- `id` - The user's id number.
- `sessionId` - A string containing the scratch session id that the user is currently logged in with.
- `token` - The session's scratch token.

## CloudSession API

Extends: [`EventEmitter`](https://nodejs.org/api/events.html#events_class_eventemitter)

### Methods

---

#### Static Methods

- `create(user, proj, [turbowarp = false])`

  - Creates and loads a new `CloudSession` for the given project using the given `UserSession`.
  - `user` - The `UserSession` to create the `CloudSession` with. If an invalid `UserSession` is provided, things may break.
  - `proj` - The id of the project to connect to. Can be a string or number.
  - `turbowarp` - Whether or not to connect to the [turbowarp](https://turbowarp.org) cloud servers instead of the scratch cloud servers.
  - `returns`: `Promise.<CloudSession>`
    <p />

  ```js
  let cloud = Scratch.CloudSession.create(session, 60917032);
  ```

- `constructor(user, proj, [turbowarp = false])`

  - Creates a new `CloudSession` for the given project using the given `UserSession`.
  - `user` - The `UserSession` to create the `CloudSession` with. If an invalid `UserSession` is provided, things may break.
  - `proj` - The id of the project to connect to. Can be a string or number.
  - `turbowarp` - Whether or not to connect to the [turbowarp](https://turbowarp.org) cloud servers instead of the scratch cloud servers.
  - `returns`: `CloudSession`
    <p />

  ```js
  let cloud = new Scratch.CloudSession(session, 60917032);
  ```

#### Instance Methods

- `connect()`

  - Connects the `CloudSession` to the cloud servers.
  - `returns`: `Promise.<undefined>`
    <p />

  ```js
  await cloud.connect();
  ```

- `end()`

  - Ends the connection with the cloud servers.
  - `returns`: `undefined`
    <p />

  ```js
  cloud.end();
  ```

- `get(name)`

  - Get the value of a cloud variable with the given `name` (including the `☁`).
  - `name` - The name of the variable to retrieve the value of (including the `☁`, see `name(n)`).
  - `returns`: `String`
    <p />

  ```js
  let value = cloud.get("☁ variable");
  ```

- `set(name, value)`

  - Set the cloud variable with the given `name` to the given `value`.
  - `name` - The name of the variable to set.
  - `value` - A number to set the cloud variable to.
  - `returns`: `undefined`
    <p />

  ```js
  cloud.set("☁ variable", 1);
  ```

- `name(n)`

  - Add the cloud symbol to the given variable name.
  - `n` - A `String` to add the cloud symbol to.
  - `returns`: `☁ ${n}`
    <p />

  ```js
  let value = cloud.get(cloud.name("variable"));
  ```

- `numerify(string)`

  - Turn a string into a series of numbers for transmission over the cloud servers.
  - `string` - The text to convert. Characters not included in the defined set will not be included.
  - `returns`: `String`
    <p />

  ```js
  cloud.set(cloud.name("variable"), cloud.numerify("value"));
  ```

- `stringify(number, [startLetter = 1])`

  - Decode a string from a number generated by the `numerify` function.
  - `number` - A string or number containing the value to decode.
  - `startLetter` - The letter of the input `number` to start the deconing from.
  - `returns`: `String`
    <p />

  ```js
  let decoded = cloud.stringify("321122311500", 0);
  ```

#### Instance Properties

- `variables` - An object containing the cloud variables that the `CloudSession` has received and their current values.
- `user` - The `UserSession` that the `CloudSession` was created with.
- `id` - The id of the project that the `CloudSession` is connected to.
- `usetw` - Whether or not the `CloudSession` is connected to the Turbowarp servers.

#### Events

- `set`- A variable was changed on the cloud servers. Listener parameters: `(name, value)`
- `open/reset` - The websocket connection connected or reconnected to the servers.
- `addvariable` - A variable was set for the first time.

## Projects Api

### `Scratch.Projects`

- `get(id)`

  - Fetch the details of the project with the given `id`.
  - `id` - A `String` or `Number` containing the project's info.
  - `returns`: `Promise.<Project>`(See the [`Project`](#project-api) api)
    <p />

  ```js
  let projectInfo = await Scratch.Projects.get(510186917);
  ```

- `getUserProjects(username, [limit = Infinity])`

  - Fetch all projects for the user with the specified `username`.
  - `username` - The username of the user to retreive the projects of.
  - `limit` - a `Number` greater than `0`; the number of projects to retreive.
  - `returns`: `Promise.<Array.<Project>>`
    <p />

  ```js
  let userProjects = await Scratch.Projects.getUserProjects(
    "ErrorGamer2000",
    40
  );
  ```

### `UserSession.projects`

- `get(id)`

  - Fetch the details of the project with the given `id`.
  - `id` - A `String` or `Number` containing the project's info.
  - `returns`: `Promise.<Project>`(See the [`Project`](#project-api) api)
    <p />

  ```js
  let projectInfo = await session.projects.get(510186917);
  ```

- `getUserProjects([limit = Infinity])`

  - Fetch all of the user's owned projects.
  - `limit` - a `Number` greater than `0`; the number of projects to retreive.
  - `returns`: `Promise.<Array.<Project>>`
    <p />

  ```js
  let userProjects = await session.projects.getUserProjects(40);
  ```

## Rest Api

### `Rest.Conference`

- `scheduleForDay(day, [zeroIndex = true])`

  - Fetch the day's schedule from the Scratch Rest api.
  - `day` - A `Number` or `String` containing the day of the week to retreive the schedule for.
  - `zeroIndex` - A `Boolean` determining whether or not day `1` should me Monday(`true`) or Tuesday (`false`);
  - `returns`: `Promise.<Object>`
  <p />

  ```js
  let schedule = await Scratch.Rest.scheduleForDay("Monday");
  ```

- `detailsFor(id)`

  - Fetch the details for the conference with the given `id`.
  - `id` - A `Number` containing the `id` of a Scratch conference.
  - `returns`: `Promise.<Object>`
  <p />

  ```js
  let details = await Scratch.Rest.Conference.detailsFor(id);
  ```

### `Rest.Users`

- `get(username)`

  - Fetch the details of the user with the given `username`.
  - `username` - A `String` containing the username of the user to retreive the details of.
  - `returns`: `Promise.<Object>`
  <p />

  ```js
  let user = Scratch.Rest.Users.get("ErrorGamer2000");
  ```

- `getFollowing(username)`

  - Fetch the list of users that the user with the given `username` is following.
  - `username` - A `String` containing the `username` of the user to fetch the following list of.
  `returns`: `Promise.<Array.<Object>>`
  <p />

  ```js
  let following = await Scratch.Rest.Users.getFollowing("ErrorGamer2000");
  ```

- `getFollowers(username)`

  - Fetch the list of users that follow the user with the given `username`.
  - `username` - A `String` containing the `username` of the user to fetch the follower list of.
  `returns`: `Promise.<Array.<Object>>`
  <p />

  ```js
  let followers = await Scratch.Rest.Users.getFollowers("ErrorGamer2000");
  ```

### Other `Rest` Methods

- `getHealth()`

  - Retreive the Scratch server's status.
  - `returns`: `Promise.<Object>`
  <p />

  ```js
  let status = await Scratch.Rest.getHealth();
  ```

- `getNews()`

  - Retreive the Scratch news.
  - `returns`: `Promise.<Array.<Object>>`
  <p />

  ```js
  let news = await Scratch.Rest.getNews();
  ```

## Other APIs

Documentation in progress...

---

## Contributors

- [ErrorGamer2000](https://github.com/ErrorGamer2000)(Creator);
- [GrahamSH-LLK](https://github.com/GrahamSH-LLK)
