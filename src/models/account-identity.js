export default function (Identity) {
  Identity.beforeRemote ('**', (context, instance, next) => {
    console.log(context.methodString)
    next()
  })

  Identity.remoteMethod('uploadLogo', {
    "description": "Uploads a single media file as photo for a Identity",
    accepts: [
      { arg: "id", type: "string", required: true},
      { arg: 'context', type: "object", http: {source:"context"} },
      { arg: 'options', type: "object", http: {source:"query"} }
    ],
    returns: {
      arg: "MediaFile", type: "object", root: true
    },
    http: {path: '/:id/uploadPhoto',verb: "post"}
  });

  Identity.uploadLogo = function (id, context, options, cb) {
    Identity.findById(id, (error, identity) => {
      if (!error && identity) {
        var MediaFile = Identity.app.models.MediaFile;
        MediaFile.upload(context, {mediableId: id, mediableType: 'Identity'}, function (error, resFile) {
          if (!error && resFile) {
            identity.updateAttributes({
              photoId: resFile[0].id,
            }, (error, instance ) => {
              if (!error && instance) {
                cb(null, resFile[0])
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

}
