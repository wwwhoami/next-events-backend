'use strict';
/**
 *  event controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::event.event', ({ strapi }) => ({

  async me(ctx) {
    const user = ctx.state.user

    if (!user) {
      return ctx.badRequest(null, [
        { messages: [{ id: "No authorization header was found" }] }
      ])
    }

    const params = new URLSearchParams(ctx.URL.search)

    let pageNum = params.get('pagination[page]')
    let pageSize = params.get('pagination[pageSize]')
    let paginationStart
    let paginationLimit

    if (typeof pageNum === 'string' && typeof pageNum === 'string') {
      pageNum = parseInt(pageNum)
      pageSize = parseInt(pageSize)
      paginationStart = (pageNum - 1) * pageSize
      paginationLimit = pageNum * pageSize
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

    const { length } = await strapi.entityService.findMany('api::event.event', {
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
        page: pageNum,
        pageSize,
        pageCount: Math.ceil(length / pageSize),
        total: length
      }
    })
  }

}));
