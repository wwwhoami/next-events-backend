'use strict';
/**
 *  event controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::event.event', ({ strapi }) => ({

  // Create user event
  async create(ctx) {
    let entity

    ctx.request.body.data.user = ctx.state.user.id
    entity = await strapi.service('api::event.event').create({ data: ctx.request.body.data })

    const sanitizedEntity = await this.sanitizeOutput(entity, ctx)

    return this.transformResponse(sanitizedEntity)
  },

  // Update user event
  async update(ctx) {
    const { id } = ctx.params

    let entity

    const [event] = await strapi.entityService.findMany('api::event.event', {
      filters: {
        id: ctx.params.id,
        user: {
          id: ctx.state.user.id
        }
      }
    })

    if (!event) return ctx.unauthorized()


    ctx.request.body.data.user = ctx.state.user.id
    entity = await strapi.entityService.update('api::event.event', id, {
      data: ctx.request.body.data,
    })

    const sanitizedEntity = await this.sanitizeOutput(entity, ctx)

    return this.transformResponse(sanitizedEntity)
  },

  // Delete user event 
  async delete(ctx) {
    const { id } = ctx.params

    const [event] = await strapi.entityService.findMany('api::event.event', {
      filters: {
        id: ctx.params.id,
        user: {
          id: ctx.state.user.id
        }
      }
    })

    if (!event) return ctx.unauthorized()

    const entity = await strapi.entityService.delete('api::event.event', id)
    const sanitizedEntity = await this.sanitizeOutput(entity, ctx)

    return this.transformResponse(sanitizedEntity)
  },

  // Get logged in user's events
  async me(ctx) {
    const user = ctx.state.user

    if (!user) {
      return ctx.badRequest(null, [
        { messages: [{ id: "No authorization header was found" }] }
      ])
    }

    const params = new URLSearchParams(ctx.URL.search)

    let page = params.get('pagination[page]')
    let pageSize = params.get('pagination[pageSize]')
    let paginationStart

    if (typeof page === 'string' && typeof page === 'string') {
      page = parseInt(page)
      pageSize = parseInt(pageSize)
      paginationStart = (page - 1) * pageSize
    }


    const data = await strapi.entityService.findMany('api::event.event', {
      filters: {
        user: {
          id: user.id
        }
      },
      populate: params.get('populate'),
      sort: params.get('sort'),
      start: paginationStart,
      limit: pageSize
    });

    const total = await strapi.entityService.count('api::event.event', {
      filters: {
        user: {
          id: user.id
        }
      }
    });


    if (!data) {
      return ctx.notFound()
    }

    const sanitizedEntity = await this.sanitizeOutput(data, ctx)

    return this.transformResponse(sanitizedEntity, {
      pagination: {
        page,
        pageSize,
        pageCount: Math.ceil(total / pageSize),
        total
      }
    })
  }

}));
