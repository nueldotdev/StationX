import { createMiddleware, log } from "station-x";

export default createMiddleware({
  ignore: ['/home'],
  handler: async (ctx, next) => { 
    console.info(`${log.title('[INFO]')} ${ctx.req.method} - ${ctx.req.url}`)
    await next();
    return true;
  },
});
