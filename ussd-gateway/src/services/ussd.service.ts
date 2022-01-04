import axios, { AxiosError } from 'axios';
import UssdMenu = require('ussd-builder');
import { LogLevels, logService } from './log.service';

const menu = new UssdMenu();

menu.startState({
  run: () => {
    // use menu.con() to send response without terminating session
    menu.con(
      'Welcome. Choose option: \n1. Get Token \n2. Delete Token \n3. Renew Token \n4. Cash In \n5. Cash Out'
    );
  },
  // next object links to next state based on user input
  next: {
    '1': 'getToken',
    '2': 'deleteToken',
    '3': 'cashIn',
    '4': 'cashOut',
  },
  defaultNext: 'invalidOption',
});

menu.state('invalidOption', {
  run: () => {
    menu.end('Invalid Option');
  },
});

menu.state('getToken', {
  run: async () => {
    await ussdGatewayRequest();
  },
});

menu.state('deleteToken', {
  run: async () => {
    await ussdGatewayRequest();
  },
});

menu.state('cashIn', {
  run: async () => {
    await ussdGatewayRequest();
  },
});

menu.state('cashOut', {
  run: async () => {
    await ussdGatewayRequest();
  },
});

async function ussdGatewayRequest() {
  try {
    var response = await axios.post(
      process.env.ENGINE_API_URL + '/hooks/ussd-gateway',
      menu.args
    );

    menu.end(response.data);
  } catch (err: any | AxiosError) {
    if (axios.isAxiosError(err) && err.response) {
      logService.log(LogLevels.ERROR, err.response?.data?.error);
      menu.end(err.response?.data?.error);
    } else {
      logService.log(LogLevels.ERROR, err.message);
      menu.end(err.message);
    }
  }
}

export { menu as UssdMenu };
