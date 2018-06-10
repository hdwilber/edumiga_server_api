export default function (Category) {
  Category.beforeRemote('**', (context, instance, next) => {
    console.log(context.methodString)
    next()
  })

  Category.prototype.buildTree = async function() {
    const children = await this.children.find()
    const results = Promise.all(children.map(async child => {
      return {
        name: child.name,
        id: child.id,
        children: await child.buildTree()
      }
    }))
    return results
  }

  Category.prototype.build = async (context) => {
    try {
      const { instance } = context
      return await instance.buildTree()
    } catch(error) {
      return error
    }
  }

  Category.remoteMethod('prototype.buildTree', {
    description: '',
    accepts: [
      { arg: 'context', type: "object", http: {source:"context"} },
    ],
    returns: {
      arg: "Category", type: "object", root: true
    },
    http: {path: '/getTree',verb: "get"}
  })

  Category.buildTree = async (context, options) => {
    try {
      const cats = await Category.find({where: { parentId: null}})
      console.log(cats.length)

      const results = await Promise.all(cats.map(async cat => {
        const tree = await cat.buildTree()
        return {
          ...cat.toObject(),
          children: tree,
        }
      }))

      return {
        list: results,
      }
    } catch(error) {
      return error
    }
  }

  Category.remoteMethod('buildTree', {
    description: '',
    accepts: [
      { arg: 'context', type: "object", http: {source:"context"} },
      { arg: 'options', type: "object", http: {source:"query"} }
    ],
    returns: {
      arg: "Category", type: "object", root: true
    },
    http: {path: '/list',verb: "get"}
  })
}

