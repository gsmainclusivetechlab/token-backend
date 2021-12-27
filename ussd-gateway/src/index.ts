import * as express from "express";
import { menu } from "./ussd";
import axios, { AxiosResponse, AxiosError } from "axios";
import "dotenv/config";

const app = express();

app.use(express.json());
app.post("/send", function (req, res) {

  const args = {
    phoneNumber: req.body.phoneNumber, //the end user's phone Number
    sessionId: req.body.sessionId,
    serviceCode: req.body.serviceCode, //the USSD code registered with your serviceCode
    //Operator: req.body.networkCode || req.body.Operator, //the end user's network Operator
    text: req.body.text,
  };

  menu.run(args, (resMsg: any) => {
    res.send(resMsg);
  });
});

app.post("/receive", function (req, res) {

  const { body } = req;
  
  const url = <string>process.env.PROXY_API_URL;

  axios.post(url + "/ussd-gateway/receive", body)
  .then((response: AxiosResponse) => {
      res.send(response.data);
  })
  .catch((error: AxiosError) => {
      res.status(500).send(error.message);
  });
});


app.listen(4200);
