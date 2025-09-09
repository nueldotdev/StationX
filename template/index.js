import { createServer, route } from 'station-x';
import './modules/app/routes.js';
import './middlewares/logger.js';

route('/home', {
  GET: (ctx) => ctx.status(200).json({ message: 'Hello, World!' })
})

const server = createServer();
server.listen(3003);