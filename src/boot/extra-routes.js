import { Countries } from '../data/countries'

export default function ExtraRoutes(app) {
  app.get('/api/constants', (request, response, next) => {
    const filter = JSON.parse(request.query.filter)

    if (filter && filter.list) {
      const ret = {}

      filter.list.forEach(i => {
        if (i === 'countries') {
          ret[i] = Countries
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
