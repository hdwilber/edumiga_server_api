const conn = new Mongo();
const edumigaDb = conn.getDB("edumiga");

edumigaDb.Account.remove({})
edumigaDb.AccountIdentity.remove({})
edumigaDb.Institution.remove({})
edumigaDb.Opportunity.remove({})
edumigaDb.Course.remove({})
edumigaDb.Prerequisite.remove({})
edumigaDb.Category.remove({})
