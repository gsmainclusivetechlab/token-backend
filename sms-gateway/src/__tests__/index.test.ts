import * as request from "supertest";
import app from "../app";

describe("POST /", () => {
  it("returns status code 200 and text 'PONG' if we send a object with property text with value 'PING' is passed", async () => {
    const res = await request(app).post("/").send({ text: "PING" });
    expect(res.statusCode).toEqual(200);
    expect(res.text).toEqual("PONG");
  });
});


