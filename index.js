const Joi = require('@hapi/joi')
const { HttpResponse } = require('crepecake')

/**
 * 
 * @param {Joi.AnySchema} schema 
 * @param {Joi.ValidationOptions} options 
 */
function crepecakeParams (schema, options) {
  return async function paramsMiddleware (ctx, next) {
    let params = Object.assign({}, ctx.request.query, ctx.request.body)

    if (schema) {
      if (options.allowUnknown === undefined) {
        options.allowUnknown = true
      }

      const { error, value } = schema.validate(params, options)

      if (error) {
        throw HttpResponse.badRequest({
          error: error.details.map(d => d.message).join(', ')
        })
      }

      params = value
    }

    ctx.state.params = params

    await next()
  }
}

module.exports = crepecakeParams
