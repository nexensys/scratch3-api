"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "UserSession", {
  enumerable: true,
  get: function () {
    return _usersession.default;
  }
});
Object.defineProperty(exports, "CloudSession", {
  enumerable: true,
  get: function () {
    return _cloudsession.default;
  }
});
Object.defineProperty(exports, "Projects", {
  enumerable: true,
  get: function () {
    return _projects.ProjectsStatic;
  }
});
Object.defineProperty(exports, "Rest", {
  enumerable: true,
  get: function () {
    return _rest.default;
  }
});
exports.default = void 0;

var _usersession = _interopRequireDefault(require("./usersession"));

var _cloudsession = _interopRequireDefault(require("./cloudsession"));

var _projects = require("./projects");

var _rest = _interopRequireDefault(require("./rest"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const Scratch = {
  UserSession: _usersession.default,
  CloudSession: _cloudsession.default,
  Projects: _projects.ProjectsStatic,
  Rest: _rest.default
};
var _default = Scratch;
exports.default = _default;