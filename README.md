# crepecake-params
Params schema validation middleware for Crepecake, based on Joi

## Introduction
This is a Koa/crepecake middleware which aims to:
1. Provide a unified way for downstream middlewares to retrive request parameters
2. Enable parameter schema validation

## Reference
- Joi: https://hapi.dev/module/joi/#introduction

## Example
```javascript
const Crepecake = require('crepecake')
const app = new Crepecake()
const params = require('crepecake-params')
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
```
