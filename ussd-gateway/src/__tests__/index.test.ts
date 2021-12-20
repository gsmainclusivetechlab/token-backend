import app from "../app";
import * as request from "supertest";

describe("POST /", () => {
  it("returns status code 200 and text 'END ACK' if we send a object with property text with value '*#0#' is passed", async () => {
    const res = await request(app).post("/").send({ text: "*#0#" });
    expect(res.statusCode).toEqual(200);
    expect(res.text).toEqual("END ACK");
  });
});
