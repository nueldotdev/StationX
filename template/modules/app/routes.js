import { route } from 'station-x';
import { initialEndpoint } from './controllers.js';

route('/', {
  GET: initialEndpoint,
});
