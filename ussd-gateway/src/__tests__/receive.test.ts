import supertest from 'supertest'
import Server from "../classes/server";
import IndexRoute from '../routes/index.route';
import SendRoute from '../routes/send.route';

let apptest: supertest.SuperTest<supertest.Test>;

beforeAll(() =>{
  const app = new Server(4100);
  const sendRoute = new SendRoute(app);
  const index = new IndexRoute(app.getRoutes());
  app.addRoute("/", index.router);
  
  apptest = supertest(app.getExpressInstance());
});

describe("POST /", () => {
    it("returns status code 200 and text 'ACK' if we send a object with property service with value '*#0#' is passed", async () => {
      const res = await apptest.post("/send").send({ serviceCode: "*#0#" });
      expect(res.statusCode).toEqual(200);
      expect(res.text).toEqual("ACK");
    });
  });

