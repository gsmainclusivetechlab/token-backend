import * as express from "express";

const router = express.Router();

router.post("*", function (req, res) {

    const { body } = req;

    if(body.text === "PING"){
        res.send("PONG");
    } else {
        res.send("Thanks for using SMS Gateway");
    }
    
    // const url = <string>process.env.WEB_HOOK_URL;

    // axios.post(url, body)
    // .then((response: AxiosResponse) => {
    //     res.send(response.data);
    // })
    // .catch((error: AxiosError) => {
    //     res.status(500).send(error.message);
    // });
});

export default router;
