var conn = new Mongo();
var db = conn.getDB("edumiga");

const user = db.Account.insertOne({
  email: 'dev@edumiga.com',
  password: '$2a$10$U2wF4SLHmNmRMk6vc4sU5utDWcC1M4kprewoy3cAatUZQ5UCxQfnG',
  created: Date.now(),
  updated: Date.now(),
})

const identity = db.AccountIdentity.insertOne({
  accountId: user.insertedId,
})

print(user.insertedId)

db.Institution.find().forEach(function (inst) {
  inst.created = Date.now()
  inst.updated = Date.now()
  inst.accountId = user.insertedId

  if (inst.levels)
    inst.levels = inst.levels.split(',');

  if (!inst.published) 
    inst.published = true

  if (inst.parent) {
    inst.parentId = db.Institution.findOne({nro: inst.parent })._id
  }
  if (inst.adminLevel === "" || !inst.adminLevel) {
    inst.adminLevel = 'main'
  }

  db.Institution.save(inst)
})

db.Opportunity.find().forEach(function (opp) {
  opp.created = Date.now()
  opp.updated = Date.now()
  opp.accountId = user.insertedId
  if(!opp.published)
    opp.published = true
  if (opp.degrees)
    opp.degrees = opp.degrees.split(',');
  if (opp.institution) {
    var inst = db.Institution.findOne({nro: opp.institution});
    opp.institutionId = inst._id;
  }

  db.Opportunity.save(opp);
})


db.Course.find().forEach(function (co) {
  co.created = Date.now()
  co.updated = Date.now()
  co.accountId = user.insertedId
  if(!co.published)
    co.published = true
  if (co.opportunity) {
    const opp = db.Opportunity.findOne({nro: co.opportunity})
    if (opp) {
      co.opportunityId = opp._id
    }
  }
  if (co.prerequisites && co.prerequisites !== ''){
    print("Exists")
    print(typeof(co.prerequisites))
    if (typeof(co.prerequisites) === 'number') {
      const prereq = db.Course.findOne({nro: co.prerequisites})
      if (prereq && prereq._id) {
        db.Prerequisite.insert({
          courseId: co._id,
          prerequisiteId: prereq._id,
          
        })
      }
    } else if (typeof(co.prerequisites) === 'string') {
      const aux = co.prerequisites.split(',');
      print("aux")
      aux.forEach(pre => {
        const prereq = db.Course.findOne({nro: parseInt(pre)})
        if (prereq && prereq._id) {
          db.Prerequisite.insert({
            courseId: co._id,
            prerequisiteId: prereq._id,
            
          })
        }
      })
    }
  }


  delete(co.prerequisites)

  db.Course.save(co);
})

