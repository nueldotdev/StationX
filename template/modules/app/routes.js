import { route } from 'station-x';
import { initialEndpoint } from './controllers';

route('/', {
  GET: initialEndpoint,
});
