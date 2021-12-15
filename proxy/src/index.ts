import * as express from "express";
import axios, { AxiosResponse, AxiosError } from "axios";
import "dotenv/config";

const app = express();

app.use(express.json());

app.post("/sms-gateway", function (req, res) {
  const { body } = req;

  const url = <string>process.env.SMS_GATEWAY_URL;

  axios
    .post(url, body)
    .then((response: AxiosResponse) => {
      res.send(response.data);
    })
    .catch((error: AxiosError) => {
      res.status(500).send(error.message);
    });
});

app.post("/ussd-gateway", function (req, res) {

  const { body } = req;

  const url = <string>process.env.USSD_GATEWAY_URL;

  axios.post(url, body)
  .then((response: AxiosResponse) => {
      res.send(response.data);
  })
  .catch((error: AxiosError) => {
      res.status(500).send(error.message);
  });
});

app.listen(4000);
