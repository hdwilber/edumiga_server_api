export default function (Subject) {
  Subject.beforeRemote ('**', (context, instance, next) => {
    console.log(context.methodString)
    next()
  })

  Subject.observe ('before save', (context, next) => {
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
}
