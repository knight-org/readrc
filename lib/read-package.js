"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class ReadRC {
  constructor(props = {}) {
    this.contextRoot = props.contextRoot || process.cwd();
    this.packInfo = this.getPackageInfo();
  }

  get(key) {
    return this.packInfo[key];
  }

  toJSON() {
    return this.packInfo;
  }

  toString() {
    return JSON.stringify(this.packInfo);
  }

  getSafeName() {
    return (this.packInfo.name || '').replace(/@/ig, '').replace(/\//ig, '-');
  }

  getPackageInfo() {
    return _fs2.default.existsSync(`${this.contextRoot}/package.json`) && require(`${this.contextRoot}/package.json`) || {};
  }

}

exports.default = ReadRC;
module.exports = exports["default"];