const pool = require("../../database/postgres/pool");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const AuthenticationsTableTestHelper = require("../../../../tests/AuthenticationsTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const ServerTestHelper = require("../../../../tests/ServerTestHelper");
const container = require("../../container");
const createServer = require("../createServer");

describe("/threads endpoint", () => {
  let server;
  let serverTestHelper;

  beforeAll(async () => {
    server = await createServer(container);
    serverTestHelper = new ServerTestHelper(server);
  });

  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
  });

  describe("when POST /threads", () => {
    it("should response 201 and added thread", async () => {
      const requestPayload = {
        title: "A thread title",
        body: "A thread body",
      };

      const { accessToken } = await serverTestHelper.getAccessTokenAndUserId();

      const response = await server.inject({
        method: "POST",
        url: "/threads",
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.addedThread).toBeDefined();
      expect(responseJson.data.addedThread.title).toEqual(requestPayload.title);
    });

    it("should response 400 if thread payload not contain needed property", async () => {
      const requestPayload = {
        title: "A thread title",
      };

      const { accessToken } = await serverTestHelper.getAccessTokenAndUserId();

      const response = await server.inject({
        method: "POST",
        url: "/threads",
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual("Missing required property");
    });

    it("should response 400 if thread payload wrong data type", async () => {
      const requestPayload = {
        title: "A thread title",
        body: 123,
      };

      const { accessToken } = await serverTestHelper.getAccessTokenAndUserId();

      const response = await server.inject({
        method: "POST",
        url: "/threads",
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual("Invalid data type");
    });

    it("should response 401 if header not contain access token", async () => {
      const requestPayload = {
        title: "A thread title",
        body: "A thread body",
      };

      const response = await server.inject({
        method: "POST",
        url: "/threads",
        payload: requestPayload,
      });

      expect(response.statusCode).toEqual(401);
    });
  });

  describe("when GET /threads/{threadId}", () => {
    it("should response 200 and thread detail", async () => {
      const thread = {
        id: "thread-123",
        title: "A thread title",
        body: "A thread body",
        date: new Date().toISOString(),
      };

      await UsersTableTestHelper.addUser({ id: "user-123" });
      await ThreadsTableTestHelper.addThread({ ...thread, owner: "user-123" });

      const response = await server.inject({
        method: "GET",
        url: `/threads/${thread.id}`,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.thread).toBeTruthy();
      expect(responseJson.data.thread.id).toEqual(thread.id);
      expect(responseJson.data.thread.title).toEqual(thread.title);
      expect(responseJson.data.thread.body).toEqual(thread.body);
    });

    it("should response 404 if thread not found", async () => {
      const response = await server.inject({
        method: "GET",
        url: "/threads/thread-123",
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual("thread not found");
    });
  });
});
