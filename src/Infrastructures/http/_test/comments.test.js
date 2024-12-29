const pool = require("../../database/postgres/pool");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const AuthenticationsTableTestHelper = require("../../../../tests/AuthenticationsTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const ServerTestHelper = require("../../../../tests/ServerTestHelper");
const container = require("../../container");
const createServer = require("../createServer");

describe("threads comment endpoint", () => {
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
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  const dummyThread = {
    id: "thread-123",
    title: "A thread title",
    body: "A thread body",
    date: new Date().toISOString(),
  };

  describe("when POST /threads/{threadId}/comments", () => {
    it("should response 201 and added comment", async () => {
      const requestPayload = {
        content: "A comment",
      };

      const { accessToken, userId } =
        await serverTestHelper.getAccessTokenAndUserId();

      await ThreadsTableTestHelper.addThread({ ...dummyThread, owner: userId });

      const response = await server.inject({
        method: "POST",
        url: `/threads/${dummyThread.id}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.addedComment).toBeTruthy();
      expect(responseJson.data.addedComment.content).toEqual(
        requestPayload.content
      );
    });

    it("should response 400 if comment payload not contain needed property", async () => {
      const { accessToken, userId } =
        await serverTestHelper.getAccessTokenAndUserId();

      await ThreadsTableTestHelper.addThread({ ...dummyThread, owner: userId });

      const response = await server.inject({
        method: "POST",
        url: `/threads/${dummyThread.id}/comments`,
        payload: {},
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual("Missing required property");
    });

    it("should response 400 if comment payload wrong data type", async () => {
      const requestPayload = {
        content: 123,
      };

      const { accessToken, userId } =
        await serverTestHelper.getAccessTokenAndUserId();

      await ThreadsTableTestHelper.addThread({ ...dummyThread, owner: userId });

      const response = await server.inject({
        method: "POST",
        url: `/threads/${dummyThread.id}/comments`,
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

    it("should response 404 if thread not found", async () => {
      const requestPayload = {
        content: "A comment",
      };

      const { accessToken } = await serverTestHelper.getAccessTokenAndUserId();

      const response = await server.inject({
        method: "POST",
        url: `/threads/${dummyThread.id}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual("thread not found");
    });

    it("should response 401 if header not contain access token", async () => {
      const requestPayload = {
        content: "A comment",
      };

      const { userId } = await serverTestHelper.getAccessTokenAndUserId();

      await ThreadsTableTestHelper.addThread({ ...dummyThread, owner: userId });

      const response = await server.inject({
        method: "POST",
        url: `/threads/${dummyThread.id}/comments`,
        payload: requestPayload,
      });

      expect(response.statusCode).toEqual(401);
    });
  });

  describe("when DELETE /threads/{threadId}/comments/{commentId}", () => {
    const dummyComment = {
      id: "comment-123",
      content: "A comment",
      date: new Date().toISOString(),
      thread: "thread-123",
      isDelete: false,
    };

    it("should response 200", async () => {
      const { accessToken, userId } =
        await serverTestHelper.getAccessTokenAndUserId();
      await ThreadsTableTestHelper.addThread({ ...dummyThread, owner: userId });
      await CommentsTableTestHelper.addComment({
        ...dummyComment,
        owner: userId,
      });

      const response = await server.inject({
        method: "DELETE",
        url: `/threads/${dummyThread.id}/comments/${dummyComment.id}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
    });

    it("should response 404 if comment not found", async () => {
      const { accessToken, userId } =
        await serverTestHelper.getAccessTokenAndUserId();
      await ThreadsTableTestHelper.addThread({ ...dummyThread, owner: userId });

      const response = await server.inject({
        method: "DELETE",
        url: `/threads/${dummyThread.id}/comments/${dummyComment.id}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual("comment not found");
    });

    it("should response 404 if comment is not valid or deleted", async () => {
      const { accessToken, userId } =
        await serverTestHelper.getAccessTokenAndUserId();
      await ThreadsTableTestHelper.addThread({ ...dummyThread, owner: userId });
      await CommentsTableTestHelper.addComment({
        ...dummyComment,
        owner: userId,
      });

      await server.inject({
        method: 'DELETE',
        url: `/threads/${dummyThread.id}/comments/${dummyComment.id}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const response = await server.inject({
        method: "DELETE",
        url: `/threads/${dummyThread.id}/comments/${dummyComment.id}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual("comment invalid");
    });

    it("should response 404 if comment is not found in thread", async () => {
      const { accessToken, userId } =
        await serverTestHelper.getAccessTokenAndUserId();
      await ThreadsTableTestHelper.addThread({ ...dummyThread, owner: userId });
      await ThreadsTableTestHelper.addThread({
        ...dummyThread,
        id: "thread-456",
        owner: userId,
      });
      await CommentsTableTestHelper.addComment({
        ...dummyComment,
        owner: userId,
      });

      const response = await server.inject({
        method: "DELETE",
        url: `/threads/thread-456/comments/${dummyComment.id}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual("comment not found");
    });

    it("should response 404 if thread not found", async () => {
      const { accessToken} =
        await serverTestHelper.getAccessTokenAndUserId();

      const response = await server.inject({
        method: "DELETE",
        url: `/threads/${dummyThread.id}/comments/${dummyComment.id}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual("thread not found");
    });

    it("should response 403 if comment owner is not authorized", async () => {
      const { userId } = await serverTestHelper.getAccessTokenAndUserId();
      const { accessToken: otherAccessToken } =
        await serverTestHelper.getAccessTokenAndUserId({
          username: "janedoe",
          password: "Password123",
          fullname: "Jane Doe",
        });

      await ThreadsTableTestHelper.addThread({ ...dummyThread, owner: userId });
      await CommentsTableTestHelper.addComment({
        ...dummyComment,
        owner: userId,
      });

      const response = await server.inject({
        method: "DELETE",
        url: `/threads/${dummyThread.id}/comments/${dummyComment.id}`,
        headers: {
          Authorization: `Bearer ${otherAccessToken}`,
        },
      });

      expect(response.statusCode).toEqual(403);
    });

    it("should response 401 if header not contain access token", async () => {
      const { userId } = await serverTestHelper.getAccessTokenAndUserId();

      await ThreadsTableTestHelper.addThread({ ...dummyThread, owner: userId });
      await CommentsTableTestHelper.addComment({ ...dummyComment, owner: userId });

      const response = await server.inject({
        method: "DELETE",
        url: `/threads/${dummyThread.id}/comments/${dummyComment.id}`,
      });

      expect(response.statusCode).toEqual(401);
    });
  });
});
