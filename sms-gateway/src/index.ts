import * as express from "express";
import axios, { AxiosResponse, AxiosError } from "axios";
import "dotenv/config";

const app = express();
app.use(express.json())

app.post("/send", function (req, res) {

    const { body } = req;

    if(body.text === "PING"){
        res.send("PONG");
        return;
    }
    
    const url = <string>process.env.WEB_HOOK_URL;

    axios.post(url + "/hooks/sms-gateway", body)
    .then((response: AxiosResponse) => {
        res.send(response.data);
    })
    .catch((error: AxiosError) => {
        res.status(500).send(error.message);
    });
});

app.post("/receive", function (req, res) {

    const { body } = req;
    
    const url = <string>process.env.PROXY_API_URL;

    axios.post(url + "/sms-gateway/receive", body)
    .then((response: AxiosResponse) => {
        res.send(response.data);
    })
    .catch((error: AxiosError) => {
        res.status(500).send(error.message);
    });
});

app.listen(4100);