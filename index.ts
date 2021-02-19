import { Middleware, ParameterizedContext, Next } from 'koa'
import { HttpResponse } from 'crepecake'
import * as yup from 'yup'

export { yup }

export interface ContextWithParams<P extends yup.BaseSchema = yup.AnySchema> extends ParameterizedContext {
  params: yup.InferType<P> & { [key: string]: any }
}

// decorator
export function params (schema: yup.BaseSchema) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const oldHandler = descriptor.value!
    descriptor.value = buildHandler(schema, oldHandler)
  }
}

// middleware
export function paramsMiddleware (schema: yup.BaseSchema) {
  return buildHandler(schema)
}

function buildHandler (schema: yup.BaseSchema, oldHandler?: Middleware) {
  return async (ctx: ParameterizedContext, next: Next) => {
    try {
      const data = {
        ...ctx.request.query,
        ...(ctx.request as any).body
      }

      const params = await schema.validate(data)
      Object.defineProperty(ctx, 'params', {
        value: params
      })

      if (oldHandler) {
        return oldHandler(ctx, next) // decorator mode
      } else {
        await next() // middleware mode
      }
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        throw HttpResponse.badRequest({ error: err.message })
      }

      throw err
    }
  }
}
