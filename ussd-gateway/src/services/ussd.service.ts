import axios, { AxiosResponse, AxiosError } from "axios";
import UssdMenu = require("ussd-builder");
import { LogLevels, logService } from "./log.service";

const menu = new UssdMenu();

menu.startState({
  run: () => {
    // use menu.con() to send response without terminating session
    menu.con("Welcome. Choose option: \n1. Get Token");
  },
  // next object links to next state based on user input
  next: {
    "*#0#": "test",
    "1": "getToken",
  },
});

menu.state("test", {
  run: () => {
    menu.end("ACK");
  },
});

menu.state("getToken", {
  run: async () => {
    try {
      var response = await axios.post(
        process.env.ENGINE_API_URL + "/hooks/ussd-gateway",
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
  },
});

export { menu as UssdMenu };
