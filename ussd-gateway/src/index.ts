import * as express from "express";
import { menu } from "./ussd";

const app = express();

app.use(express.json());
app.post("*", function (req, res) {

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

app.listen(4100);
