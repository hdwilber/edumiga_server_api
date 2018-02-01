var conn = new Mongo();
var db = conn.getDB("edumiga");

db.Institution.remove({})
db.Opportunity.remove({})
db.Prerequisite.remove({})

