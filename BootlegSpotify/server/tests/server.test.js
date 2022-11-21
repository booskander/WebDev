/* eslint-disable no-magic-numbers */
const app = require("../server");

describe("Server tests", () => {
  afterAll(async () => {
    app.close();
  });
  it("should create a server", async () => {
    expect(app).not.toBeNull();
  });
});
