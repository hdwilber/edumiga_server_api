var conn = new Mongo();
var db = conn.getDB("edumiga");

db.Institution.find().forEach(function (inst) {
  if (inst.levels)
    inst.levels = inst.levels.split(',');
    inst.adminLevel = 'main'
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


