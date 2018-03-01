var conn = new Mongo();
var db = conn.getDB("edumiga");

db.Account.remove({})
db.AccountIdentity.remove({})
db.Institution.remove({})
db.Opportunity.remove({})
db.Course.remove({})
db.Prerequisite.remove({})

