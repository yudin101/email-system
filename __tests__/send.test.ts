import request from "supertest";
import db from "../src/db";
import app from "../src";
import { hashPassword } from "../src/utils/helpers";

describe("POST /api/send", () => {
  let agent: request.SuperAgentTest;

  const mockUsers = [
    {
      username: "tester0",
      email: "tester0@test.com",
      password: hashPassword("tester123"),
    },
    {
      username: "tester1",
      email: "tester1@test.com",
      password: hashPassword("tester123"),
    },
  ];

  beforeAll(async () => {
    try {
      const insertStmt = db.prepare(
        "INSERT INTO users (username, email, password) VALUES (@username, @email, @password)",
      );
      const insertMultipleUsers = db.transaction((users) => {
        for (const user of users) insertStmt.run(user);
      });

      insertMultipleUsers(mockUsers);

      agent = request.agent(app);

      await agent
        .post("/api/login")
        .send({
          username: mockUsers[0].username,
          password: "tester123",
        })
        .expect(200);
    } catch (err) {
      console.error("Error creating test user:", err);
    }
  });

  afterAll(() => {
    try {
      const deleteUserStmt = db.prepare(
        "DELETE FROM users WHERE email = @email",
      );
      const deleteEmailStmt = db.prepare(`
        DELETE FROM mails
        WHERE sender_id = (
          SELECT id FROM users
          WHERE email = @email
        )
      `);

      const cleanTestUsers = db.transaction((users) => {
        for (const user of users) {
          const userEmail = { email: user.email };

          deleteEmailStmt.run(userEmail);
          deleteUserStmt.run(userEmail);
        }
      });

      cleanTestUsers(mockUsers);
    } catch (err) {
      console.error("Error cleaning test user:", err);
    }
  });

  test("200 on successful send", async () => {
    const res = await agent.post("/api/send").send({
      receiverEmails: ["tester1@test.com"],
      subject: "test subject",
      body: "this is a test body",
    });

    expect(res.statusCode).toEqual(200);
  });

  test("202 on completed with errors", async () => {
    const res = await agent.post("/api/send").send({
      receiverEmails: [
        "tester1@test.com",
        "tester0@test.com",
        "hello@test.com",
      ],
      subject: "test subject",
      body: "this is a test body",
    });

    expect(res.statusCode).toEqual(202);
  });

  test("404 on email not found", async () => {
    const res = await agent.post("/api/send").send({
      receiverEmails: ["hello@test.com"],
      subject: "test subject",
      body: "this is a test body",
    });

    expect(res.statusCode).toEqual(404);
  });

  test("400 on cannot mail yourself", async () => {
    const res = await agent.post("/api/send").send({
      receiverEmails: ["tester0@test.com"],
      subject: "test subject",
      body: "this is a test body",
    });

    expect(res.statusCode).toEqual(400);
  });

  test("400 on no emails sent", async () => {
    const res = await agent.post("/api/send").send({
      receiverEmails: ["tester0@test.com", "hello@test.com"],
      subject: "test subject",
      body: "this is a test body",
    });

    expect(res.statusCode).toEqual(400);
  });
});
