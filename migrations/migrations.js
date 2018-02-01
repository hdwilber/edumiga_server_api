var conn = new Mongo();
var db = conn.getDB("edumiga");

db.Institution.find().forEach(function (inst) {
  if (inst.levels)
    inst.levels = inst.levels.split(',');

  if (inst.parent) {
    inst.parentId = db.Institution.findOne({nro: inst.parent })._id
  }
  if (inst.adminLevel === "" || !inst.adminLevel) {
    inst.adminLevel = 'main'
  }

  db.Institution.save(inst)
})

db.Opportunity.find().forEach(function (opp) {
  if (opp.degrees)
    opp.degrees = opp.degrees.split(',');
  if (opp.institution) {
    var inst = db.Institution.findOne({nro: opp.institution});
    opp.institutionId = inst._id;
  }

  db.Opportunity.save(opp);
})


db.Course.find().forEach(function (co) {
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

