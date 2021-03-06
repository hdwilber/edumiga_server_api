export default function (app) {
  const Role = app.models.Role

  // Rewriting default principal roles due to extending AccessToken
  Role.registerResolver('$authenticated', (role, context, cb) => {
    const { accessToken } = context
    return (accessToken.accountId) ? cb(null, true): process.nextTick(() => cb(null, false))
  })

  Role.registerResolver('$owner', (role, context, cb) => {
    const { accessToken, modelId, model, modelName } = context;

    model.count( {id: modelId, accountId: accessToken.accountId}, (error, count) => {
      if (!error && count) {
        return cb(null, true)
      } else {
        return process.nextTick(() => cb(null, false))
      }
    })
  })
}
