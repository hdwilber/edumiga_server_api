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

  Institution.remoteMethod('findAllResumes', {
    description: "Returns resume for search",
    accepts: [
      { arg: 'filter', type: "object", http: {source:"query"} }
    ],
    returns: {
      arg: "institutions", type: "Institution", root: true
    },
    http: { path: '/resumes', verb: "get" }
  })

  async function countNestedOpportunities(institution) {
    let opps = await institution.opportunities.count()
    const deplist = await institution.dependencies.find()
    let deps = deplist.length

    const results = await Promise.all( deplist.map(dep => {
      return countNestedOpportunities(dep)
    }))

    results.forEach(res => {
      opps +=res.opportunities
      deps +=res.dependencies
    })

    return {
      dependencies: deps,
      opportunities: opps,
    }
  }

  Institution.findAllResumes = function (filter, cb) {
    Institution.find(filter, (error, institutions) => {
      if (!error) {
        const responses = Promise.all(institutions.map(inst => countNestedOpportunities(inst)))
        responses.then( stats => {
          const results = stats.map((stat, index) => {
            const institution = institutions[index]
            institution.stats = stat
            return institution
          })
          cb(null, results)
        })
      } else {
        cb(error)
      }
    })
  }
  Institution.afterRemote('findAllResumes', (context, instance, next) => {
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
}
