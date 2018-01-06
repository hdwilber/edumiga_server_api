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

  Institution.remoteMethod ('uploadMedia', {
    "description": "Uploads media files for a Institution",
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
  };
}
