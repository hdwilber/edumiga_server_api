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
    }
  })

  Account.confirm = function (uid, token, redirect, next) {
    console.log(next)
    Account.findById(uid, (error, account ) => {
      if (!error && account) {
        const clearToken = token.trim()

        if (account.verificationToken === clearToken) {
          account.verifiedEmail = true
          account.verificationToken = null
          account.save( function (error, newAccount) {
            if (!error) {
              //context.result = {
                //extra: 'data'
              //}
              next(null, { data:1 })
            } else {
              //context.result = {
                //extra: 'data',
                //result: 2,
              //}
              //next()
              next(null, { data:2 })
            }
          })
        } else {
          //context.result = {
            //extra: 'data',
            //result: 3,
          //}
          //next()
          next(null, { data:3 })
        }
      } else {
        //context.result = {
          //extra: 'error',
          //result: 10,
        //}
        //next()
          next(null, { data:4 })
      }
    })
  }

  Account.afterRemote ('confirm', (context, instance, next) => {
    console.log(context)
    //console.log(context)
    //console.log(instance)
    //context.result = {
      //message: 'Email verified'
    //}
    next()
  })

  //Account.afterRemoteError('confirm', (context, next) => {
    //console.log(context)
    //next({
      //hola: 'mundo'
    //})
  //})



  Account.remoteMethod(
    'confirm2',
    {
      description: 'Confirm a user registration with identity verification token.',
      accepts: [
        //{arg: 'context', type: 'object', http: { source:'context' }},
        {arg: 'uid', type: 'string', required: true},
        {arg: 'token', type: 'string', required: true},
        {arg: 'redirect', type: 'string'},
      ],
      returns: {arg: 'data', type: 'object'},
      http: {verb: 'get', path: '/confirm2'},
    }
  );
}
