const Crepecake = require('crepecake')
const app = new Crepecake()
const params = require('./index')
const Joi = require('@hapi/joi')
const Router = Crepecake.Router
const route = new Router()

const getSchema = Joi.object({
  name: Joi.string().required(),
  test: Joi.boolean().default(false),
  date: Joi.date().required()
})

route.get('/', params(getSchema, { abortEarly: false }), async ctx => {
  console.log(ctx.state.params)
  return ctx.state.params
})

app.use(route)

app.listen(8888)
