import { createServer, route } from 'station-x';
import './modules/app/routes.js';
import './middlewares/logger.js';

const server = createServer();
server.listen(3003);