export default function (Course) {
  Course.beforeRemote ('**', (context, instance, next) => {
    console.log(context.methodString)
    next()
  })

  Course.observe ('before save', (context, next) => {
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

  function prerequisiteAdd(Prerequisite, courseId, prerequisiteId) {
    return new Promise((resolve, reject) => {
      Prerequisite.create({
        prerequisiteId: courseId, courseId: prerequisiteId,
      }, (error, pre) => {
        if (!error) {
          resolve(pre)
        } else {
          reject(error)
        }
      })
    })
  }

  Course.afterRemote('prototype.patchAttributes', (context, instance, next) => {
    const Prerequisite = Course.app.models.Prerequisite
    if (context.args.data) {
      const { prerequisites } = context.args.data
      if (prerequisites) {
        Prerequisite.remove({courseId: instance.id,}, (error) => {
          if (!error) {
            console.log(instance)
            const promises = prerequisites.map(p => prerequisiteAdd(Prerequisite, instance.id, p))
            Promise.all(promises)
            .then(prerequisites => {
              next()
            })
            .catch(error => {
              next(error)
            })
          } else {
            next(error)
          }
        })
      } else {
        next()
      }
    }
  })
}
