import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { axiosInstance } from './api/axiosInstance';

window.Pusher = Pusher;
Pusher.logToConsole = true;

const echo = new Echo({
  broadcaster: 'pusher',
  key: 'edfa52038306d027a470',
  cluster: 'ap3',
  forceTLS: true,
  encrypted: true,
  authorizer: (channel, options) => {
    return {
      authorize: (socketId, callback) => {
        axiosInstance.post('/my-broadcast-auth', {
          socket_id: socketId,
          channel_name: channel.name,
        }, {
          withCredentials: true,
          headers: {
            'X-XSRF-TOKEN': decodeURIComponent(
              document.cookie
                .split('; ')
                .find(row => row.startsWith('XSRF-TOKEN='))?.split('=')[1] || ''
            ),
          },
        })
        .then(response => {
          callback(false, response.data);
        })
        .catch(error => {
          callback(true, error);
        });
      }
    };
  }
});

export default echo;


/*import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const echo = new Echo({
  broadcaster: 'pusher',
  key: 'ebbd1a8dc8e2a07ffb7e',
  cluster: 'ap3',
  forceTLS: true,
  authEndpoint: 'https://myapp.test/my-broadcast-auth',
  withCredentials: true,
    auth: {
  headers: {
    'X-XSRF-TOKEN': decodeURIComponent(
      document.cookie
        .split('; ')
        .find(row => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1] || ''
    ),
  },
  },
});

export default echo;*/
