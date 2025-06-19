import request from "supertest";
import app from "../src";
import db from "../src/db";

describe("POST /api/register", () => {
  const TEST_USERNAME = "tester";
  const TEST_EMAIL = "tester@test.com";
  const TEST_PASSWORD = "tester123";

  const EXISTING_USERNAME = "oldtester";
  const EXISTING_EMAIL = "old@test.com";
  const EXISTING_PASSWORD = "tester123";

  beforeAll(() => {
    try {
      db.prepare(
        "INSERT INTO users (username, email, password) VALUES (?, ? ,?)",
      ).run(EXISTING_USERNAME, EXISTING_EMAIL, EXISTING_PASSWORD);
    } catch (err) {
      console.error("Error creating existing user (register):", err);
    }
  });

  afterAll(() => {
    try {
      db.prepare("DELETE FROM users WHERE username = ?").run(EXISTING_USERNAME);
      db.prepare("DELETE FROM users WHERE username = ?").run(TEST_USERNAME);
    } catch (err) {
      console.error("Error cleaning user (register):", err);
    }
  });

  test("201 on sucessful registration", async () => {
    const res = await request(app).post("/api/register").send({
      username: TEST_USERNAME,
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });

    expect(res.statusCode).toEqual(201);
  });

  test("400 on email exists", async () => {
    const res = await request(app).post("/api/register").send({
      username: "something",
      email: EXISTING_EMAIL,
      password: EXISTING_PASSWORD,
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toEqual("Email already exists!");
  });

  test("400 on username exists", async () => {
    const res = await request(app).post("/api/register").send({
      username: EXISTING_USERNAME,
      email: "something@test.com",
      password: EXISTING_PASSWORD,
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toEqual("Username already exists!");
  });
});
