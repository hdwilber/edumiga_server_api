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
}
