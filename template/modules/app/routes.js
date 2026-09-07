import { route } from 'station-x';
import { initialEndpoint } from './controllers.js';

route.group('/api', (api) => {
	api.get('/', initialEndpoint.GET);
	api.post('/', initialEndpoint.POST);
});
