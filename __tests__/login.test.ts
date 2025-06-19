import request from "supertest";
import app from "../src/index";
import { hashPassword } from "../src/utils/helpers";
import db from "../src/db";

describe("POST /api/login", () => {
  const TEST_USER_USERNAME = "test";
  const TEST_USER_EMAIL = "test@test.com";
  const TEST_USER_PASSWORD = "hello123";
  let userId: number;

  beforeAll(() => {
    const hashedPassword = hashPassword(TEST_USER_PASSWORD);
    try {
      db.prepare("DELETE FROM users WHERE email = ?").run(TEST_USER_EMAIL);
      const result = db
        .prepare(
          "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
        )
        .run(TEST_USER_USERNAME, TEST_USER_EMAIL, hashedPassword);
      userId = result.lastInsertRowid as number;
      console.log("Created test user with ID:", userId);
    } catch (err) {
      console.error("Error creating test user:", err);
      throw err;
    }
  });

  afterAll(() => {
    try {
      db.prepare("DELETE FROM users WHERE email = ?").run(TEST_USER_EMAIL);
      console.log(`Cleaned up test user: ${TEST_USER_EMAIL}`);
    } catch (error) {
      console.error("Error cleaning up test user:", error);
    }
  });

  // LOGIN SUCCESS

  test("200 on success", async () => {
    const res = await request(app).post("/api/login").send({
      username: TEST_USER_USERNAME,
      password: TEST_USER_PASSWORD,
    });

    expect(res.statusCode).toEqual(200);
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  // WRONG CREDENTIALS

  test("401 on wrong username", async () => {
    const res = await request(app).post("/api/login").send({
      username: "wekghjekrjgberjghrkgrgkejgberkjgb",
      password: TEST_USER_PASSWORD,
    });

    expect(res.statusCode).toEqual(401);
  });

  test("401 on wrong password", async () => {
    const res = await request(app).post("/api/login").send({
      username: TEST_USER_USERNAME,
      password: "definitely not real password",
    });

    expect(res.statusCode).toEqual(401);
  });

  test("401 on wrong username and password", async () => {
    const res = await request(app).post("/api/login").send({
      username: "wekghjekrjgberjghrkgrgkejgberkjgb",
      password: "lkejheugkfdjglworrtyiwro893764298349unfni8yv8v7",
    });

    expect(res.statusCode).toEqual(401);
  });
});
