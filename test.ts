import Crepecake, { Router, HttpResponse } from 'crepecake'
import CrepecakeCommon from 'crepecake-common'
import { params, paramsMiddleware, ContextWithParams, yup } from './index'
import { expect } from 'chai'
import { describe, before, it } from 'mocha'
import supertest from 'supertest'

const paginationParams = yup.object({
  offset: yup.number().integer().default(0),
  limit: yup.number().integer().default(10)
})

const getParams = yup.object({
  query: yup.string().required()
}).concat(
  paginationParams
)

const postParams = yup.object({
  data: yup.array(
    yup.object({
      name: yup.string().required(),
      email: yup.string().email()
    })
  ).required()
}) 

class FooController {
  async getFoo (ctx: ContextWithParams<typeof getParams>) {
    return {
      get: 'ok',
      ...ctx.params
    }
  }

  @params(postParams)
  async postFoo (ctx: ContextWithParams<typeof postParams>) {
    return {
      post: 'ok',
      ...ctx.params
    }
  }
}

describe('Crepecake Params Test', () => {
  let server: any
  let request: supertest.SuperTest<supertest.Test>

  before(async () => {
    const app = new Crepecake()

    const router = new Router()
    const fooController = new FooController()

    router.get('/foo', paramsMiddleware(getParams), fooController.getFoo)
    router.post('/foo', fooController.postFoo)

    app.use(CrepecakeCommon())
    app.use(router)

    server = app.listen()
    request = supertest(server)
  })

  after(() => {
    server.close()
  })

  describe('GET query params', () => {
    it('should raise 400 if required params is missing', async () => {
      await request
        .get('/foo')
        .expect(400)
    })

    it('should have all params constructed if properly provided', async () => {
      const res = await request
        .get('/foo')
        .query({ query: 'bar' })
        .expect(200)

      expect(res.body.get).eql('ok')
      expect(res.body.query).eql('bar')
      expect(res.body.offset).eql(0)
      expect(res.body.limit).eql(10)
    })

    it('extra params should be allowed', async () => {
      const res = await request
        .get('/foo')
        .query({ query: 'bar', more: 'yes' })
        .expect(200)

      expect(res.body.more).eql('yes')
    })
  })

  describe('POST body params', () => {
    it('should raise 400 if body is missing', async () => {
      await request
        .post('/foo')
        .expect(400)
    })

    it('should have all params constructed if properly provided', async () => {
      const res = await request
        .post('/foo')
        .send({ data: [
          { name: 'foo', email: 'foo@example.com' }
        ] })
        .expect(200)

      expect(res.body).to.have.property('data').of.length(1)
      expect(res.body.data[0]).to.eql({
        name: 'foo',
        email: 'foo@example.com'
      })
    })
  })
})
