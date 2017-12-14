import Mailer from '../lib/mail'
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
    next()
    if (context.isNewInstance) {
      Mailer.send({
        recipientEmail: context.instance.email,
        token: context.instance.verificationToken,
        verificationUrl: `http:\/\/localhost:3001/api/Accounts/confirm?uid=${context.instance.id}&token=${context.instance.verificationToken}`
      })
      .then (res => {
        next()
      })
      .catch (error => {
        next(error)
      })
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
          next(new Error('This token has been already used'))
        }
      } else {
        next(error)
      }
    })
  }

  Account.afterRemote ('confirm', (context, instance, next) => {
    context.result = {
      message: 'Email verified'
    }
    next()
  })

  Account.remoteMethod(
    'confirm',
    {
      description: 'Confirm a user registration with identity verification token.',
      accepts: [
        {arg: 'uid', type: 'string', required: true},
        {arg: 'token', type: 'string', required: true},
        {arg: 'redirect', type: 'string'},
      ],
      returns: {arg: 'data', type: 'object'},
      http: {verb: 'get', path: '/confirm'},
    }
  );
}
