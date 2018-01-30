import Mailer from '../lib/mailer'
import crypto from 'crypto'

export default function (Account) {

  Account.beforeRemote ('**', (context, instance, next) => {
    console.log(context.methodString)
    next()
  })

  Account.observe ('before save', (context, next) => {
    const now = Date.now();
    context.instance.updated = now
    if (context.isNewInstance) {
      context.instance.created = now
      crypto.randomBytes(64, (error, buf) => {
        if (!error && buf) {
          context.instance.verificationToken = buf.toString('hex')
          context.instance.verifiedEmail = false
          next()
        } else {
          next(new Error('something went wrong'))
        }
      });
    } else {
      next()
    }
  })

  Account.observe ('after save', (context, next) => {
    if (context.isNewInstance) {
      Mailer.send({
        recipientEmail: context.instance.email,
        token: context.instance.verificationToken,
        verificationUrl: `http:\/\/localhost:3000/account/confirm?uid=${context.instance.id}&token=${context.instance.verificationToken}`
      })

      const Identity = Account.app.models.AccountIdentity
      Identity.create({
        accountId: context.instance.id,
      }, (error, identity) => {
        if (!error && identity) {
          next()
        }  else {
          next(error)
        }

      })
    } else {
      next()
    }
  })

  Account.confirm = function (uid, token, redirect, next) {
    Account.findById(uid, (error, account ) => {
      if (!error && account) {
        const clearToken = token.trim()
        if (account.verificationToken === clearToken) {
          account.verifiedEmail = true
          account.verificationToken = null
          account.save( function (error, newAccount) {
            if (!error) {
              next()
            } else {
              next(error)
            }
          })
        } else {
          next({code: 'INVALID_TOKEN', message: 'Invalid token', statusCode: 404})
        }
      } else {
        next(error)
      }
    })
  }

  Account.resendConfirm = function(context, next) {
    console.log(context)
    const { accessToken } = context.req
    console.log(context.instance)

    Account.findById(accessToken.accountId, (error, account) => {
      if (!error && account && account.verificationToken) {
        Mailer.send({
          recipientEmail: account.email,
          token: account.verificationToken,
          verificationUrl: `http:\/\/localhost:3000/account/confirm?uid=${account.id}&token=${account.verificationToken}`
        })
        next()
      } else {
        next({message: 'Confirmation is not necessary', statusCode: 404})
      }
    })
  }

  Account.remoteMethod('resendConfirm', {
    description: "Resend verification token to email",
    accepts: [
      { arg: 'context', type: "object", http: {source: 'context'} },
    ],
    returns: {
      arg: 'result', type: 'object', root: true
    },
    http: { path: '/reconfirm', verb: 'GET' }
  })
}
