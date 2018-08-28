import { Countries } from '../data/countries'
import { Categories } from '../data/categories'
import { TimeUnits } from '../data/time'

export default function ExtraRoutes(app) {
  app.get('/api/constants', (request, response, next) => {
    const filter = JSON.parse(request.query.filter)

    if (filter && filter.list) {
      const ret = {}

      filter.list.forEach(i => {
        if (i === 'countries') {
          ret[i] = Countries
        } else if (i === 'categories') {
          ret[i] = Categories
        } else if (i === 'timeUnits') {
          ret[i] = TimeUnits
        } else {
          ret[i] = null
        }
      })
      response.send(ret)

    } else {
      response.send({
        countries: Countries
      })
    }
  })
}
