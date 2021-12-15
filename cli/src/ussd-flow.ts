import * as inquirer from "inquirer";
import axios, { AxiosResponse } from "axios";
import 'dotenv/config'

export async function ussdGatewayFlow(answers: any) {
    try {
      const body = {
        phoneNumber: answers.phoneNumber, //the end user's phone Number
        sessionId: "123",
        serviceCode: "123", //the USSD code registered with your serviceCode
        //Operator: "123", //the end user's network Operator
        text: "",
      };
  
      const url = <string>process.env.USSD_GATEWAY_URL + "/ussd";
  
      //Answer about transaction
      let axiosResponse: AxiosResponse = await axios.post(url, body);
  
      let newAnswer: inquirer.QuestionCollection = [
        {
          type: "input",
          name: "text",
          message: axiosResponse.data
        },
      ];
  
      const textAnswer = await inquirer.prompt(newAnswer);

      body.text += textAnswer.text;
  
      axiosResponse = await axios.post(url, body);
      console.log(axiosResponse.data);
  
    } catch (error: any) {
      console.log(error.message);
    }
}