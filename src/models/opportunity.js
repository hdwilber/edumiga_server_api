import { Regimes, Degrees, Attendances, } from '../data/opportunity/constants'

export default function (Opportunity) {
  Opportunity.beforeRemote ('**', (context, instance, next) => {
    console.log(context.methodString)
    next()
  })

  Opportunity.observe ('before save', (context, next) => {
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

  Opportunity.beforeRemote('prototype.__create__courses', (context, instance, next) => {
    const { accessToken } = context.req
    const Course = Opportunity.app.models.Course

    if (context.instance) {
      Course.findOne({where:{ 
        accountId: accessToken.accountId, 
        opportunityId: context.instance.id,
        draft: true
      }, include: []}, (error, course) => {
        if (!error) {
          if (course) {
            context.res.json(course)
          } else {
            next()
          }
        } else {
          next(new Error('Something went wrong'))
        }
      })
    } else {
      next(new Error('It doesnt exists'))
    }
  })
  Opportunity.remoteMethod ('uploadMedia', {
    "description": "Uploads media files for a Opportunity",
    accepts: [
      { arg: "id", type: "string", required: true},
      { arg: 'context', type: "object", http: {source:"context"} },
      { arg: 'options', type: "object", http: {source:"query"} }
    ],
    returns: {
      arg: "MediaFile", type: "object", root: true
    },
    http: {path: '/:id/uploadMedia',verb: "post"}
  });

  Opportunity.uploadMedia = function (id, context, options, cb) {
    Opportunity.exists(id, function (error, exists) {
      if (!error && exists) {
        var MediaFile = Opportunity.app.models.MediaFile;
        MediaFile.upload(context, {mediableId: id, mediableType: 'Opportunity'}, function (error, resFile) {
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
  };

  Opportunity.remoteMethod('uploadLogo', {
    "description": "Uploads a single media file as logo for a Opportunity",
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

  Opportunity.uploadLogo = function (id, context, options, cb) {
    Opportunity.findById(id, (error, opportunity) => {
      if (!error && opportunity) {
        var MediaFile = Opportunity.app.models.MediaFile;
        MediaFile.upload(context, {mediableId: id, mediableType: 'Opportunity'}, function (error, resFile) {
          if (!error && resFile) {
            opportunity.updateAttributes({
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

  Opportunity.remoteMethod('types', {
    description: "Returns constants for types",
    accepts: [
    ],
    returns: {
      arg: "Types", type: "array", root: true
    },
    http: { path: '/types', verb: "get" }
  })

  Opportunity.types = function (cb) {
    cb(null, {
      regimes: Regimes,
      degrees: Degrees,
      attendances: Attendances,
    })
  }
}
