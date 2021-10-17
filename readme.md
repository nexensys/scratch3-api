# scratch3-api

> ### Now Supporting [Turbowarp](https://turbowarp.org)!

A remake of [trumank's scratch-api](https://www.npmjs.com/package/scratch-api) optimized for scratch 3.0. It not only adds to the api, but is also composed mostly of promises to prevent [callback hell](http://callbackhell.com/). So, instead of

```ts
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

```ts
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

```ts
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

```ts
const Scratch = require("scratch3-api");
// or
const { UserSession, CloudSession, Projects, Rest } = require("scratch3-api");
```

### ESM

```ts
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

- `create(username?: string, password?: string): Promise<UserSession>`

  - Creates and loads a new UserSession with the given username and password.
  - `username` - The Scratch account username (not case sensitive). Optional. If not provided user will be prompted.
  - `password` - The Scratch account password. Optional. If not provided user will be prompted.
       <!--- For some reason this is needed to keep code from overlapping last bullet --->
    <p />

  ```ts
  let session = await Scratch.UserSession.create("<username>", "<password>");

  //Could also be done with
  let session = new Scratch.UserSession();
  await session.load("<username>", "<password>");
  ```

- `constructor(): Usersession`

  - Creates a blank, unloaded `UserSession`.
    <p />

  ```ts
  let session = new Scratch.UserSession();
  ```

#### Instance Methods

- `load(username?: string, password?: string): Promise<void>`

  - Loads the `UserSession` instance with the given name and password.
  - `username` - The Scratch account username (not case sensitive). Optional. If not provided user will be prompted.
  - `password` - The Scratch account password.
    <p />

  ```ts
  await session.load("<username", "<password>");
  ```

- `prompt(): Promise<void>`

  > ⚠ Deprecated! This feature will be removed soon. Please use `<UserSession>.load` without parameters instead.

  - Prompts the user for their username and password then loads the `UserSession`.
    <p />

  ```ts
  await session.prompt();
  ```

- `verify(): Promise<boolean>`

  - Validates the `UserSession`'s login.
    <p />

  ```ts
  const valid = await session.verify();
  ```

- `comment(options: { [key: string]: string }): Promise<void>`

  - Validates the `UserSession`'s login.
  - `options`
    - `project`, `user`, or `studio` - The project, user, or studio to comment on. User must be a username and the others must be ids.
    - `parent` - The comment id to reply to. Optional.
    - `replyto` - The user id to address (@username ...). Optional.
    - `content` - The text of the comment to post.
    <p />

  ```ts
  await session.comment({
    project: 517845853,
    content: "Commented from Node.js with scratch3-api!"
  });
  ```

- `cloudSession(proj: number | string, turbowarp: boolean = false): Promise<CloudSession>`

  - Create a new [`CloudSession`](#cloudsession-api) for the given project with the current `UserSession` and connects it. - `proj` - The id of the project to connect to. Can be a string or number. - `turbowarp` - Whether or not to connect to the [turbowarp](https://turbowarp.org) cloud servers instead of the scratch
  <p />

  ```ts
  let cloud = await session.cloudSession(60917032);
  ```

### Instance Properties

- `get` `projects: Projects` - Returns a new instance of the [`Projects`](#projects-api) api.
- `loaded: boolean` - Whether or not the session has been loaded with a username and password.
- `valid: boolean` - Whether or not the session is valid.
- `username: string | undefined` - The username that the session was loaded with. Will not be defined if the `load()` method has not been called.
- `password: string | undefined` - The password that the session was loaded with. Will not be defined if the `load()` method has not been called.
- `id: string | number` - The user's id number.
- `sessionId: string` - The scratch session id that the user is currently logged in with.
- `token: string` - The session's scratch token.

## CloudSession API

Extends: [`EventEmitter`](https://nodejs.org/api/events.html#events_class_eventemitter)

### Methods

---

#### Static Methods

- `create(user: UserSession, proj: string | number, turbowarp: boolean = false): Promise<CloudSession>`

  - Creates and loads a new `CloudSession` for the given project using the given `UserSession`.
  - `user` - The `UserSession` to create the `CloudSession` with. If an invalid `UserSession` is provided, things may break.
  - `proj` - The id of the project to connect to. Can be a string or number.
  - `turbowarp` - Whether or not to connect to the [turbowarp](https://turbowarp.org) cloud servers instead of the scratch cloud servers.
    <p />

  ```ts
  let cloud = Scratch.CloudSession.create(session, 60917032);
  ```

- `constructor(user: UserSession, proj: string | number, turbowarp: boolean = false): CloudSession`

  - Creates a new `CloudSession` for the given project using the given `UserSession`.
  - `user` - The `UserSession` to create the `CloudSession` with. If an invalid `UserSession` is provided, things may break.
  - `proj` - The id of the project to connect to. Can be a string or number.
  - `turbowarp` - Whether or not to connect to the [turbowarp](https://turbowarp.org) cloud servers instead of the scratch cloud servers.
    <p />

  ```ts
  let cloud = new Scratch.CloudSession(session, 60917032);
  ```

#### Instance Methods

- `connect(): Promise<void>`

  - Connects the `CloudSession` to the cloud servers.
    <p />

  ```ts
  await cloud.connect();
  ```

- `end(): void`

  - Ends the connection with the cloud servers.
    <p />

  ```ts
  cloud.end();
  ```

- `get(name: string): number | string`

  - Get the value of a cloud variable with the given `name` (including the `☁`).
  - `name` - The name of the variable to retrieve the value of (including the `☁`, see `name(n)`).
    <p />

  ```ts
  let value = cloud.get("☁ variable");
  ```

- `set(name: string, value: number | string): void`

  - Set the cloud variable with the given `name` to the given `value`.
  - `name` - The name of the variable to set.
  - `value` - A number to set the cloud variable to.
    <p />

  ```ts
  cloud.set("☁ variable", 1);
  ```

- `name(n: string): string`

  - Add the cloud symbol to the given variable name.
  - `n` - A name to add the cloud symbol to.
    <p />

  ```ts
  let value = cloud.get(cloud.name("variable"));
  //☁ variable
  ```

- `numerify(str: string): string`

  - Turn a string into a series of numbers for transmission over the cloud servers.
  - `string` - The text to convert. Characters not included in the [defined set](https://github.com/ErrorGamer2000/scratch3-api/blob/master/src/cloudsession.ts#L269) will not be included.
    <p />

  ```ts
  cloud.set(cloud.name("variable"), cloud.numerify("value"));
  ```

- `stringify(number: string | number, startLetter: number = 1): string`

  - Decode a string from a number generated by the `numerify` function.
  - `number` - A string or number containing the value to decode.
  - `startLetter` - The letter of the input `number` to start the deconing from.
    <p />

  ```ts
  let decoded = cloud.stringify("321122311500", 0);
  ```

#### Instance Properties

- `variables: { [name: string]: string | number }` - An object containing the cloud variables that the `CloudSession` has received and their current values.
- `user: UserSession` - The `UserSession` that the `CloudSession` was created with.
- `id: string | number` - The id of the project that the `CloudSession` is connected to.
- `usetw: boolean` - Whether or not the `CloudSession` is connected to the Turbowarp servers.

#### Events

- `set`- A variable was changed on the cloud servers. Listener parameters: `(name: string, value: string | number)`
- `open/reset` - The websocket connection connected or reconnected to the servers.
- `addvariable` - A variable was set for the first time.

## Projects Api

### `Scratch.Projects`

- `get(id: string | number): Promise<Project>`

  - Fetch the details of the project with the given `id`.
  - `id` - The id of the project to fetch.
    <p />

  ```ts
  let projectInfo = await Scratch.Projects.get(510186917);
  ```

- `getUserProjects(username: string, limit: number = Infinity): Promise<Project[]>`

  - Fetch all projects for the user with the specified `username`.
  - `username` - The username of the user to retreive the projects of.
  - `limit` - a number greater than `0`; the number of projects to retreive.
    <p />

  ```ts
  let userProjects = await Scratch.Projects.getUserProjects(
    "ErrorGamer2000",
    40
  );
  ```

### `UserSession.projects`

- `get(id: string | number): Promise<Project>`

  - Fetch the details of the project with the given `id`.
  - `id` - The id of the project to fetch.
    <p />

  ```ts
  let projectInfo = await session.projects.get(510186917);
  ```

- `getUserProjects(limit: number = Infinity): Promise<Project[]>`

  - Fetch all of the user's owned projects.
  - `limit` - a number greater than `0`; the number of projects to retreive.
    <p />

  ```ts
  let userProjects = await session.projects.getUserProjects(40);
  ```

## Rest Api

### `Rest.Conference`

- `scheduleForDay(day: string | number, zeroIndex: boolean = true): Promise<{ [key: string]: any }>`

  - Fetch the day's schedule from the Scratch Rest api.
  - `day` - The day of the week to retreive the schedule for.
  - `zeroIndex` - Whether or not day `1` should me Monday(`true`) or Tuesday (`false`);
  <p />

  ```ts
  let schedule = await Scratch.Rest.scheduleForDay("Monday");
  ```

- `detailsFor(id: number): Promise<{ [key: string]: any }>`

  - Fetch the details for the conference with the given `id`.
  - `id` - The id of a Scratch conference.
  <p />

  ```ts
  let details = await Scratch.Rest.Conference.detailsFor(id);
  ```

### `Rest.Users`

- `get(username: string): Promise<{ [key: string]: any }>`

  - Fetch the details of the user with the given `username`.
  - `username` - The username of the user to retreive the details of.
  <p />

  ```ts
  let user = Scratch.Rest.Users.get("ErrorGamer2000");
  ```

- `getFollowing(username: string): Promise<{ [key: string]: any }[]>`

  - Fetch the list of users that the user with the given `username` is following.
  - `username` - The `username` of the user to fetch the following list of.
  <p />

  ```ts
  let following = await Scratch.Rest.Users.getFollowing("ErrorGamer2000");
  ```

- `getFollowers(username: string): Promise<{ [key: string]: any }[]>`

  - Fetch the list of users that follow the user with the given `username`.
  - `username` - The `username` of the user to fetch the follower list of.
  <p />

  ```ts
  let followers = await Scratch.Rest.Users.getFollowers("ErrorGamer2000");
  ```

### Other `Rest` Methods

- `getHealth(): Promise<{ [key: string]: any }>`

  - Retreive the Scratch server's status.
  <p />

  ```ts
  let status = await Scratch.Rest.getHealth();
  ```

- `getNews(): Promise<{ [key: string]: any }[]>`

  - Retreive the Scratch news.
  <p />

  ```ts
  let news = await Scratch.Rest.getNews();
  ```

## Other APIs

Documentation in progress...

---

## Contributors

- [ErrorGamer2000](https://github.com/ErrorGamer2000)(Creator);
- [GrahamSH-LLK](https://github.com/GrahamSH-LLK)
