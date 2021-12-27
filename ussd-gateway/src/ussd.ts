import * as UssdMenu from "ussd-builder";
import axios, { AxiosResponse, AxiosError } from "axios";
import "dotenv/config";

export const menu = new UssdMenu();

menu.startState({
  run: () => {
    // use menu.con() to send response without terminating session
    menu.con("Welcome. Choose option: \n1. Get Token");
  },
  // next object links to next state based on user input
  next: {
    "*# 0000 #": "test",
    "1": "getToken",
  },
});

menu.state("test", {
  run: () => {
    menu.end("ACK");
  },
});

menu.state("getToken", {
  run: () => {
    const url = <string>process.env.WEB_HOOK_URL;

    axios
      .post(url + "/hooks/ussd-gateway", menu.args)
      .then((response: AxiosResponse) => {
        menu.end(response.data);
      })
      .catch((error: AxiosError) => {
        console.log(error);
        menu.end("Error");
      });
  },
});
