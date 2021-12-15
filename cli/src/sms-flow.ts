import axios, { AxiosResponse } from "axios";
import 'dotenv/config'

export async function smsGatewayFlow(answers: any) {
  try {
    const body = {
      senderPhoneNumber: "",
      receivingPhoneNumber: answers.phoneNumber,
      text: answers.text
    };

    const url = <string>process.env.SMS_GATEWAY_URL + "/sms";

    let axiosResponse: AxiosResponse = await axios.post(url, body);
    console.log(axiosResponse.data);
  } catch (error: any) {
    console.log(error.message);
  }
}
