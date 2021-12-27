import * as express from "express";
import axios, { AxiosResponse, AxiosError } from "axios";
import "dotenv/config";
import * as cors from "cors";

var sms_message = "";
var ussd_message = "";

const app = express();

app.use(express.json());
app.use(cors());

app.post("/sms-gateway/send", function (req, res) {
  const { body } = req;

  const url = <string>process.env.SMS_GATEWAY_URL;

  sms_message = "";

  axios
    .post(url + "/send", body)
    .then((response: AxiosResponse) => {
      res.send(response.data);
    })
    .catch((error: AxiosError) => {
      res.status(500).send(error.message);
    });
});

app.post("/sms-gateway/receive", async function (req, res) {
  const { body } = req;
  sms_message = body.message;
  res.status(200).end();
});

app.get("/sms-message", function (req, res) {
  res.send({message: sms_message});
});

app.post("/ussd-gateway/send", function (req, res) {

  const { body } = req;

  ussd_message = "";

  const url = <string>process.env.USSD_GATEWAY_URL;

  axios.post(url + "/send", body)
  .then((response: AxiosResponse) => {
      res.send(response.data);
  })
  .catch((error: AxiosError) => {
      res.status(500).send(error.message);
  });
});

app.post("/ussd-gateway/receive", async function (req, res) {
  const { body } = req;
  ussd_message = body.message;
  res.status(200).end();
});

app.get("/ussd-message", function (req, res) {
  res.send({message: ussd_message});
});

app.listen(4000);
