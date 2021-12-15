import * as UssdMenu from "ussd-builder";

export const menu = new UssdMenu();

menu.startState({
  run: () => {
    // use menu.con() to send response without terminating session
    menu.con("Enter the text:");
  },
  // next object links to next state based on user input
  next: {
    "*# 0000 #": "test",
    "*[a-zA-Z0-9_.-]+": "alive"
  },
});

menu.state("test", {
  run: () => {
    menu.end("ACK");
  }
});

menu.state("alive", {
  run: () => {
    menu.end("Thanks for using USSD Gateway");
  }
});

