import * as assert from "assert";
import { describe, it } from "node:test";
import { fromBase64, toBase64 } from "../src/utils.js";

describe("base64", () => {
  it("should encode correctly", () => {
    assert.strictEqual(
      toBase64({ A: true, B: 42, C: "XYZ 🫎" }), //
      "eyJBIjp0cnVlLCJCIjo0MiwiQyI6IlhZWiDwn6uOIn0=",
    );
  });
  it("should decode correctly", () => {
    assert.deepEqual(
      fromBase64("eyJBIjp0cnVlLCJCIjo0MiwiQyI6IlhZWiDwn6uOIn0="), //
      { A: true, B: 42, C: "XYZ 🫎" },
    );
  });
});
