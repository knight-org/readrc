
import fs from 'fs'
import path from 'path'
import Hjson from 'hjson'
import fg from 'fast-glob'
import ReadPackage from './read-package'

export default class ReadRC {

  constructor (props = {}) {
    this.fileNames = [ '.bscpmrc', '.bscpmrc.json' ]
    this.contextRoot = props.contextRoot || process.cwd()
    this.fsGlobOps = { 'onlyDirectories': true }
  }

  toJSON () {
    let packInfo = this.extractRCFromPakcage()
    let rc = {}
    for (let filename of this.fileNames) {
      if (fs.existsSync(`${this.contextRoot}/${filename}`)) {
        rc = Hjson.parse(fs.readFileSync(`${this.contextRoot}/${filename}`, 'utf-8'))
        break
      }
    }
    return Object.assign({}, packInfo, rc)
  }

  get (key) {
    return this.toJSON()[key]
  }

  getLocalModulesPath () {
    const libsPath = this.getLibsPath(false)
    return libsPath.map(p => path.join(this.contextRoot, p))
  }

  /*
   filter private module
  */
  getPublishModulesPath (absolute = true) {
    const libsPath = this.getLibsPath(false)
    const totalPMPaths = fg.sync([ ...this.get('privates') ], this.fsGlobOps).join(' ')
    const paths = libsPath.filter(cp => !totalPMPaths.match(new RegExp(cp), 'ig'))
    if (absolute) {
      return paths.map(p => path.join(this.contextRoot, p))
    }
    return paths
  }

  getComponentsPath (absolute = true) {
    const paths = fg.sync(this.toJSON().components, this.fsGlobOps)
    if (absolute) {
      return paths.map(p => path.join(this.contextRoot, p))
    }
    return paths
  }

  getLibsPath (absolute = true) {
    const { components, libs } = this.toJSON()
    const libsPath = new Set(libs.concat(components))
    const paths = fg.sync([ ...libsPath ], this.fsGlobOps)
    if (absolute) {
      return paths.map(p => path.join(this.contextRoot, p))
    }
    return paths
  }

  getPackageInfo () {
    const packInfo = new ReadPackage({ 'contextRoot': this.contextRoot })
    return packInfo.toJSON()
  }

  extractRCFromPakcage () {
    const { maintainers = [], name, description } = this.getPackageInfo()
    const developers = maintainers.map(developer => developer.name)

    return {
      'name': name,
      'description': description,
      'developers': developers, // TODO: remove
      'team': 'Unknown',
      'components': [], // fs-glob
      'libs': [],       // fs-glob
      'privates': [],   // fs-glob
      'lifecycle': {    // hooks
        'prebuildOnly': '',   // trigger when component build static
        'postbuild': ''       // after all module build
      },
      'category': '',
      'device': '',
      'mock': {
        'https': ''
      }
    }
  }
}
