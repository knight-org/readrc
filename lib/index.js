"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _hjson = require("hjson");

var _hjson2 = _interopRequireDefault(_hjson);

var _fastGlob = require("fast-glob");

var _fastGlob2 = _interopRequireDefault(_fastGlob);

var _readPackage = require("./read-package");

var _readPackage2 = _interopRequireDefault(_readPackage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class ReadRC {
  constructor(props = {}) {
    this.fileNames = ['.bscpmrc', '.bscpmrc.json'];
    this.contextRoot = props.contextRoot || process.cwd();
    this.fsGlobOps = {
      'onlyDirectories': true
    };
  }

  toJSON() {
    let packInfo = this.extractRCFromPakcage();
    let rc = {};

    for (let filename of this.fileNames) {
      if (_fs2.default.existsSync(`${this.contextRoot}/${filename}`)) {
        rc = _hjson2.default.parse(_fs2.default.readFileSync(`${this.contextRoot}/${filename}`, 'utf-8'));
        break;
      }
    }

    return Object.assign({}, packInfo, rc);
  }

  get(key) {
    return this.toJSON()[key];
  }

  getLocalModulesPath() {
    const libsPath = this.getLibsPath(false);
    return libsPath.map(p => _path2.default.join(this.contextRoot, p));
  }
  /*
   filter private module
  */


  getPublishModulesPath(absolute = true) {
    const libsPath = this.getLibsPath(false);

    const totalPMPaths = _fastGlob2.default.sync([...this.get('privates')], this.fsGlobOps).join(' ');

    const paths = libsPath.filter(cp => !totalPMPaths.match(new RegExp(cp), 'ig'));

    if (absolute) {
      return paths.map(p => _path2.default.join(this.contextRoot, p));
    }

    return paths;
  }

  getComponentsPath(absolute = true) {
    const paths = _fastGlob2.default.sync(this.toJSON().components, this.fsGlobOps);

    if (absolute) {
      return paths.map(p => _path2.default.join(this.contextRoot, p));
    }

    return paths;
  }

  getLibsPath(absolute = true) {
    const {
      components,
      libs
    } = this.toJSON();
    const libsPath = new Set(libs.concat(components));

    const paths = _fastGlob2.default.sync([...libsPath], this.fsGlobOps);

    if (absolute) {
      return paths.map(p => _path2.default.join(this.contextRoot, p));
    }

    return paths;
  }

  getPackageInfo() {
    const packInfo = new _readPackage2.default({
      'contextRoot': this.contextRoot
    });
    return packInfo.toJSON();
  }

  extractRCFromPakcage() {
    const {
      maintainers = [],
      name,
      description
    } = this.getPackageInfo();
    const developers = maintainers.map(developer => developer.name);
    return {
      'name': name,
      'description': description,
      'developers': developers,
      // TODO: remove
      'team': 'Unknown',
      'components': [],
      // fs-glob
      'libs': [],
      // fs-glob
      'privates': [],
      // fs-glob
      'lifecycle': {
        // hooks
        'prebuildOnly': '',
        // trigger when component build static
        'postbuild': '' // after all module build

      },
      'category': '',
      'device': '',
      'mock': {
        'https': ''
      }
    };
  }

}

exports.default = ReadRC;
module.exports = exports["default"];