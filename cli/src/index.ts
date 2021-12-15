import * as inquirer from "inquirer";
import "dotenv/config";
import { smsGatewayFlow } from "./sms-flow";
import { ussdGatewayFlow } from "./ussd-flow";

const main = async () => {

  const phoneNumber = "1234324234";

  const mainOptions = [
    {
      type: "list",
      name: "gateway",
      message: "Your phone number is " + phoneNumber + "\nChoose an option:",
      choices: ["SMS", "USSD"],
      default: "SMS",
    },
  ];

  const SMSOptions = [
    {
      type: "input",
      name: "phoneNumber",
      message: "What's the receiving phone number?",
    },
    {
      type: "input",
      name: "text",
      message: "Enter the text:",
    },
  ];

  const USSDOptions = [
    {
      type: "input",
      name: "phoneNumber",
      message: "What's the receiving phone number?",
    },
  ];

  const answers = await inquirer.prompt(mainOptions);

  answers.gateway === "SMS"
    ? inquirer.prompt(SMSOptions).then((answers) => {
        smsGatewayFlow(answers);
      })
    : inquirer.prompt(USSDOptions).then((answers) => {
        ussdGatewayFlow(answers);
      });
};

main();
