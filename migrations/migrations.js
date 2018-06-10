const conn = new Mongo();
const edumigaDb = conn.getDB("edumiga");

const user = edumigaDb.Account.insertOne({
  email: 'dev@edumiga.com',
  password: '$2a$10$U2wF4SLHmNmRMk6vc4sU5utDWcC1M4kprewoy3cAatUZQ5UCxQfnG',
  created: Date.now(),
  updated: Date.now(),
})

const identity = edumigaDb.AccountIdentity.insertOne({
  accountId: user.insertedId,
})


function setDefaults(collection, data, options = {}) {
  const now = new Date()
  const { accountId, parent, nro } = options
  const def = {
    created: now,
    updated: now,
  }
  if (options.accountId) {
    def.accountId = accountId
  }

  if (options.parent) {
    const par = collection.findOne({nro: data.parent})
    def.parentId = par && par._id
  }
  return def
}


edumigaDb.Institution.find().forEach(function (inst) {
  const defs = setDefaults(edumigaDb.Institution, inst, { 
    accountId: user.insertedId,
    parent: true
  })

  if (inst.levels)
    inst.levels = inst.levels.split(',');

  if (!inst.published) 
    inst.published = true

  if (inst.adminLevel === "" || !inst.adminLevel) {
    inst.adminLevel = 'main'
  }

  edumigaDb.Institution.save(Object.extend(inst, defs))
})

edumigaDb.Opportunity.find().forEach(function (opp) {
  const defs = setDefaults(edumigaDb.Opportunity, opp, { 
    accountId: user.insertedId,
  })

  if(!opp.published)
    opp.published = true
  if (opp.degrees)
    opp.degrees = opp.degrees.split(',');
  if (opp.institution) {
    var inst = edumigaDb.Institution.findOne({nro: opp.institution});
    opp.institutionId = inst._id;
  }
  edumigaDb.Opportunity.save(Object.extend(opp, defs));
})


edumigaDb.Course.find().forEach(function (co) {
  const defs = setDefaults(edumigaDb.Course, co, { 
    accountId: user.insertedId,
  })
  if(!co.published)
    co.published = true
  if (co.opportunity) {
    const opp = edumigaDb.Opportunity.findOne({nro: co.opportunity})
    if (opp) {
      co.opportunityId = opp._id
    }
  }
  if (co.prerequisites && co.prerequisites !== ''){
    if (typeof(co.prerequisites) === 'number') {
      const prereq = edumigaDb.Course.findOne({nro: co.prerequisites})
      if (prereq && prereq._id) {
        edumigaDb.Prerequisite.insert({
          courseId: co._id,
          prerequisiteId: prereq._id,
          
        })
      }
    } else if (typeof(co.prerequisites) === 'string') {
      const aux = co.prerequisites.split(',');
      aux.forEach(pre => {
        const prereq = edumigaDb.Course.findOne({nro: parseInt(pre)})
        if (prereq && prereq._id) {
          edumigaDb.Prerequisite.insert({
            courseId: co._id,
            prerequisiteId: prereq._id,
            
          })
        }
      })
    }
  }
  edumigaDb.Course.save(Object.extend(co, defs));
})

edumigaDb.Category.find().forEach(function (cat) {
  const defs = setDefaults(edumigaDb.Category, cat, { 
    parent: true
  })
  edumigaDb.Category.save(Object.extend(cat, defs))
})

//Remove fields that are not necessary anymore
function removeFields(collection, vars = []) {
  const target = {}
  vars.forEach(v => target[v] = 1)
  collection.update({}, { $unset: target }, { multi: true })
}

removeFields(edumigaDb.Category, ['nro', 'parent'])
