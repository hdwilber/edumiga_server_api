export default function (Location) {
  Location.observe('before save', (ctx, next) => {
    const now = new Date()

    if (ctx.isNewInstance) {
      ctx.instance.created = now
      ctx.instance.updated = now
    } else {
      ctx.data.updated = now
    }

    next()
  })
}
