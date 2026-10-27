import test from "node:test";
import assert from "node:assert/strict";
import { forecast } from "../weather.mjs";
test("demo mode is explicit and converts temperatures", async () => {
  const r = await forecast(" London ", "metric", { key: "" });
  assert.equal(r.status, 200);
  assert.equal(r.body.sample, true);
  assert.equal(r.body.temp, 15);
});
test("invalid input never reaches the provider", async () => {
  let calls = 0;
  const options = {
    key: "test",
    fetcher: () => {
      calls++;
    },
  };
  assert.equal((await forecast("", "metric", options)).status, 400);
  assert.equal((await forecast("Tokyo", "kelvin", options)).status, 400);
  assert.equal(calls, 0);
});
test("unknown sample cities have a useful error", async () => {
  assert.equal((await forecast("Atlantis", "metric", { key: "" })).status, 404);
});
test("upstream failures do not expose credentials or raw responses", async () => {
  const r = await forecast("Tokyo", "metric", {
    key: "test-only",
    fetcher: async () => {
      throw new Error("private upstream error");
    },
  });
  assert.equal(r.status, 502);
  assert.ok(!JSON.stringify(r).includes("private"));
});
test("live results are normalized and encoded", async () => {
  let requested;
  const r = await forecast("New York", "imperial", {
    key: "test-only",
    fetcher: async (url) => {
      requested = url;
      return {
        ok: true,
        json: async () => ({
          name: "New York",
          sys: { country: "US" },
          weather: [{ description: "clear sky" }],
          main: {
            temp: 71,
            feels_like: 70,
            humidity: 50,
            temp_min: 66,
            temp_max: 75,
          },
        }),
      };
    },
  });
  assert.equal(requested.searchParams.get("q"), "New York");
  assert.equal(r.body.sample, false);
  assert.equal(r.body.feels, 70);
});
