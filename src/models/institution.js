import { flattenDeep } from '../lib/utils'
import { Types, Levels, AdminLevels } from '../data/institution/constants'
import { Countries } from '../data/countries'

export default function (Institution) {
  Institution.beforeRemote ('**', (context, instance, next) => {
    console.log(context.methodString)
    next()
  })

  Institution.observe ('before save', (context, next) => {
    const now = Date.now();
    if (context.isNewInstance) {
      const { accessToken } = context.options
      context.instance.created = now
      context.instance.updated = now
      context.instance.accountId = accessToken.accountId
    } else {
      delete context.data.id
      context.data.updated = now
    }
    next()
  })

  function getFilter(context) {
    const { args } = context
    if (args.filter && args.filter.where) {
      return args.filter.where
    } 
    return null
  }

  Institution.beforeRemote('find', (context, instance, next) => {
    const { args } = context
    if (args.filter && args.filter.where) {
      const { where } = args.filter
      console.log(context.args.filter)

    } 
    next()
  })

  Institution.afterRemote('find', (context, instance, next) => {
    const filter = getFilter(context)
    Institution.count(filter, (error, count) => {
      if (!error) {
        context.result = {
          count,
          list: instance,
        }
        next()
      }
    })
  })

  Institution.remoteMethod('uploadLogo', {
    "description": "Uploads a single media file as logo for a Institution",
    accepts: [
      { arg: "id", type: "string", required: true},
      { arg: 'context', type: "object", http: {source:"context"} },
      { arg: 'options', type: "object", http: {source:"query"} }
    ],
    returns: {
      arg: "MediaFile", type: "object", root: true
    },
    http: {path: '/:id/uploadLogo',verb: "post"}
  });

  Institution.uploadLogo = function (id, context, options, cb) {
    Institution.findById(id, (error, institution) => {
      if (!error && institution) {
        var MediaFile = Institution.app.models.MediaFile;
        MediaFile.upload(context, {mediableId: id, mediableType: 'Institution'}, function (error, resFile) {
          if (!error && resFile) {
            institution.updateAttributes({
              logoId: resFile[0].id,
            }, (error, instance ) => {
              if (!error && instance) {
                cb(null, resFile)
              } else {
                console.log(error)
              }
            })
          } else {
            cb(error);
          }
        });
      } else {
        cb(error);
      }
    })
  }

  Institution.remoteMethod ('uploadMedia', {
    description: "Uploads media files for a Institution",
    accepts: [
      { arg: "id", type: "string", required: true},
      { arg: 'context', type: "object", http: {source:"context"} },
      { arg: 'array', type: "object", http: {source:"body"} }
    ],
    returns: {
      arg: "MediaFile", type: "object", root: true
    },
    http: {path: '/:id/uploadMedia',verb: "post"}
  });

  Institution.uploadMedia = function (id, context, options, cb) {
    Institution.exists(id, function (error, exists) {
      if (!error && exists) {
        var MediaFile = Institution.app.models.MediaFile;
        MediaFile.upload(context, {mediableId: id, mediableType: 'Institution'}, function (error, resFile) {
          if (!error) {
            cb(null, resFile);
          } else {
            cb(error);
          }
        });
      } else {
        cb(error);
      }
    })
  }

  Institution.remoteMethod('types', {
    description: "Returns constants for types",
    accepts: [
    ],
    returns: {
      arg: "Types", type: "object", root: true
    },
    http: { path: '/types', verb: "get" }
  })

  Institution.types = function (cb) {
    cb(null, {
      types: Types,
      levels: Levels,
      adminLevels: AdminLevels,
      countries: Countries,
    })
  }

  Institution.remoteMethod('findByIdResume', {
    description: 'Returns a resume by institution id',
    accepts: [
      { arg: 'id', type: 'string', required: true, },
      { arg: 'context', type: "object", http: {source:"context"} },
    ],
    returns: {
      arg: 'institution', type: 'Institution', root: true, 
    },
    http: { path: '/:id/resume', verb: 'get' }
  })

  function getLocation(institution) {
    const instLocation = institution.location 
      ? institution.location.toObject()
      : {}

    return {
      ...instLocation,
      info: `${institution.prename} ${institution.name}`,
    }
  }

  async function getResume(institution, main = true) {
    const deplist = await institution.dependencies.find()
    const opplist = await institution.opportunities.find()
    const categories = await institution.categories.find()
    const data = {
      institution: institution.toObject(),
      categories, 
      opportunities: opplist,
      main,
    }
        
    const partials = Promise.all(deplist.map( dep => getResume(dep, false)))

    if (!deplist.length)
      return data

    return flattenDeep(await partials).concat([data])
  }

  Institution.findByIdResume = function(id, context, cb) {
    Institution.findById(id, (error, institution) => {
      if (!error && institution) {
        getResume(institution)
        .then( resume => {
          const result = {
            ...institution.toObject(),
            resume: buildResume(resume),
          }
          cb(null, result)
        })
        .catch(error => {
          console.log(error)
          cb(error)
        })
      } else {
        cb(error)
      }
    })
  }

  Institution.remoteMethod('findAllResumes', {
    description: "Returns resume for search",
    accepts: [
    ],
    returns: {
      arg: "institutions", type: "Institution", root: true
    },
    http: { path: '/resumes', verb: "get" }
  })

  Institution.remoteMethod('findAllOwned', {
    description: "Returns resume for search",
    accepts: [
      { arg: 'context', type: "object", http: {source:'context'} },
    ],
    returns: {
      arg: "institutions", type: "Institution", root: true
    },
    http: { path: '/owned', verb: "get" }
  })

  function buildResume(flatted) {
    const dependencies = []
    let opportunities = []
    const stats = {
      categories: [],
      opportunities: 0,
      dependencies: {},
    }
    if (Array.isArray(flatted)) {
      flatted.forEach(data => {
        if (!data.main) {
          dependencies.push(data.institution)
          const name = data.institution.adminLevel
          const current = stats.dependencies[name] || 0
          stats.dependencies[name] = current +1
        }
        opportunities = opportunities.concat(data.opportunities)
        stats.categories = stats.categories.concat(data.categories)
        stats.opportunities += data.opportunities.length

      })
    } else {
      opportunities = flatted.opportunities
      stats.opportunities = flatted.opportunities.length
    }
    return {
      dependencies,
      opportunities,
      stats,
    }
  }

  async function generateResume(filter) {
    const institutions = await Institution.find(filter)
    const resumes = await Promise.all(institutions.map(institution => getResume(institution)))
    const result = resumes.map((resume, index) => {
      return {
        ...institutions[index].toObject(),
        resume: buildResume(resume),
      }
    })
    return {
      count: institutions.length,
      list: result
    }
  }

  Institution.findAllOwned = async function (context) {
    const { accountId } = context.req.accessToken
    const filter = { where: { adminLevel: 'main', accountId, }}
    return await generateResume(filter)
  }

  Institution.findAllResumes = async function () {
    const filter = { where: { adminLevel: 'main' }}
    return await generateResume(filter)
  }
}
