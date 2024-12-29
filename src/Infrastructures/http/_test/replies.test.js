const pool = require("../../database/postgres/pool");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const AuthenticationsTableTestHelper = require("../../../../tests/AuthenticationsTableTestHelper");
const RepliesTableTestHelper = require("../../../../tests/RepliesTableTestHelper");
const ServerTestHelper = require("../../../../tests/ServerTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const container = require("../../container");
const createServer = require("../createServer");

describe("/replies endpoint", () => {
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
    await RepliesTableTestHelper.cleanTable();
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

  const dummyComment = {
    id: "comment-123",
    content: "A comment",
    date: new Date().toISOString(),
    thread: dummyThread.id,
    isDelete: false,
  };

  describe("when POST /threads/{threadId}/comments/{commentId}/replies", () => {
    it("should response 201 and added reply", async () => {
      const requestPayload = {
        content: "A reply",
      };

      const { accessToken, userId } =
        await serverTestHelper.getAccessTokenAndUserId();

      await ThreadsTableTestHelper.addThread({ ...dummyThread, owner: userId });
      await CommentsTableTestHelper.addComment({
        ...dummyComment,
        owner: userId,
      });

      const response = await server.inject({
        method: "POST",
        url: `/threads/${dummyThread.id}/comments/${dummyComment.id}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.addedReply).toBeTruthy();
      expect(responseJson.data.addedReply.content).toEqual(
        requestPayload.content
      );
    });

    it("should response 400 if payload not container needed property", async () => {
      const { accessToken, userId } =
        await serverTestHelper.getAccessTokenAndUserId();

      await ThreadsTableTestHelper.addThread({ ...dummyThread, owner: userId });
      await CommentsTableTestHelper.addComment({
        ...dummyComment,
        owner: userId,
      });

      const response = await server.inject({
        method: "POST",
        url: `/threads/${dummyThread.id}/comments/${dummyComment.id}/replies`,
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

    it("should response 400 if payload wrong data type", async () => {
      const requestPayload = {
        content: 1234,
      };

      const { accessToken, userId } =
        await serverTestHelper.getAccessTokenAndUserId();

      await ThreadsTableTestHelper.addThread({ ...dummyThread, owner: userId });
      await CommentsTableTestHelper.addComment({
        ...dummyComment,
        owner: userId,
      });

      const response = await server.inject({
        method: "POST",
        url: `/threads/${dummyThread.id}/comments/${dummyComment.id}/replies`,
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

    it("should response 404 if replied comment not found in thread", async () => {
      const requestPayload = {
        content: "A reply",
      };

      const { accessToken, userId } =
        await serverTestHelper.getAccessTokenAndUserId();

      await ThreadsTableTestHelper.addThread({ ...dummyThread, owner: userId });
      await CommentsTableTestHelper.addComment({
        ...dummyComment,
        owner: userId,
      });
      await ThreadsTableTestHelper.addThread({
        ...dummyThread,
        id: "thread-456",
        owner: userId,
      });

      const response = await server.inject({
        method: "POST",
        url: `/threads/thread-456/comments/${dummyComment.id}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual("comment not found");
    });

    it("should response 404 if comment not found", async () => {
      const requestPayload = {
        content: "A reply",
      };

      const { accessToken, userId } =
        await serverTestHelper.getAccessTokenAndUserId();

      await ThreadsTableTestHelper.addThread({ ...dummyThread, owner: userId });

      const response = await server.inject({
        method: "POST",
        url: `/threads/${dummyThread.id}/comments/comment-456/replies`,
        payload: requestPayload,
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
      const requestPayload = {
        content: "A reply",
      };

      const { accessToken, userId } =
        await serverTestHelper.getAccessTokenAndUserId();

      await ThreadsTableTestHelper.addThread({ ...dummyThread, owner: userId });
      await CommentsTableTestHelper.addComment({
        ...dummyComment,
        owner: userId,
      });

      await server.inject({
        method: "DELETE",
        url: `/threads/${dummyThread.id}/comments/${dummyComment.id}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const response = await server.inject({
        method: "POST",
        url: `/threads/${dummyThread.id}/comments/${dummyComment.id}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual("comment invalid");
    });

    it("should response 404 if thread not found", async () => {
      const requestPayload = {
        content: "A reply",
      };

      const { accessToken } = await serverTestHelper.getAccessTokenAndUserId();

      const response = await server.inject({
        method: "POST",
        url: `/threads/thread-456/comments/${dummyComment.id}/replies`,
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
        content: "A reply",
      };

      const { userId } = await serverTestHelper.getAccessTokenAndUserId();

      await ThreadsTableTestHelper.addThread({
        ...dummyThread,
        owner: userId,
      });
      await CommentsTableTestHelper.addComment({
        ...dummyComment,
        owner: userId,
      });

      const response = await server.inject({
        method: "POST",
        url: `/threads/${dummyThread.id}/comments/${dummyComment.id}/replies`,
        payload: requestPayload,
      });

      expect(response.statusCode).toEqual(401);
    });
  });

  describe("when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}", () => {
    const dummyReply = {
      id: "reply-123",
      content: "A reply",
      date: new Date().toISOString(),
      comment: dummyComment.id,
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
      await RepliesTableTestHelper.addReply({ ...dummyReply, owner: userId });

      const response = await server.inject({
        method: "DELETE",
        url: `/threads/${dummyThread.id}/comments/${dummyComment.id}/replies/${dummyReply.id}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
    });

    it("should response 404 if reply not found", async () => {
      const { accessToken, userId } =
        await serverTestHelper.getAccessTokenAndUserId();

      await ThreadsTableTestHelper.addThread({ ...dummyThread, owner: userId });
      await CommentsTableTestHelper.addComment({
        ...dummyComment,
        owner: userId,
      });

      const response = await server.inject({
        method: "DELETE",
        url: `/threads/${dummyThread.id}/comments/${dummyComment.id}/replies/${dummyReply.id}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual("reply not found");
    });

    it("should response 404 if reply is not valid or deleted", async () => {
      const { accessToken, userId } =
        await serverTestHelper.getAccessTokenAndUserId();

      await ThreadsTableTestHelper.addThread({ ...dummyThread, owner: userId });
      await CommentsTableTestHelper.addComment({
        ...dummyComment,
        owner: userId,
      });
      await RepliesTableTestHelper.addReply({ ...dummyReply, owner: userId });

      await server.inject({
        method: "DELETE",
        url: `/threads/${dummyThread.id}/comments/${dummyComment.id}/replies/${dummyReply.id}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const response = await server.inject({
        method: "DELETE",
        url: `/threads/${dummyThread.id}/comments/${dummyComment.id}/replies/${dummyReply.id}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual("reply invalid");
    });

    it("should response 404 if comment not found", async () => {
      const { accessToken, userId } =
        await serverTestHelper.getAccessTokenAndUserId();

      await ThreadsTableTestHelper.addThread({ ...dummyThread, owner: userId });

      const response = await server.inject({
        method: "DELETE",
        url: `/threads/${dummyThread.id}/comments/${dummyComment.id}/replies/${dummyReply.id}`,
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
      await RepliesTableTestHelper.addReply({ ...dummyReply, owner: userId });

      await server.inject({
        method: "DELETE",
        url: `/threads/${dummyThread.id}/comments/${dummyComment.id}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const response = await server.inject({
        method: "DELETE",
        url: `/threads/${dummyThread.id}/comments/${dummyComment.id}/replies/${dummyReply.id}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual("comment invalid");
    });

    it("should response 404 if thread not found", async () => {
      const { accessToken } = await serverTestHelper.getAccessTokenAndUserId();

      const response = await server.inject({
        method: "DELETE",
        url: `/threads/${dummyThread.id}/comments/${dummyComment.id}/replies/${dummyReply.id}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual("thread not found");
    });

    it("should response 404 if replied comment not found in thread", async () => {
      const { accessToken, userId } =
        await serverTestHelper.getAccessTokenAndUserId();

      await ThreadsTableTestHelper.addThread({ ...dummyThread, owner: userId });
      await CommentsTableTestHelper.addComment({
        ...dummyComment,
        owner: userId,
      });
      await RepliesTableTestHelper.addReply({ ...dummyReply, owner: userId });
      await ThreadsTableTestHelper.addThread({
        ...dummyThread,
        id: "thread-456",
        owner: userId,
      });

      const response = await server.inject({
        method: "DELETE",
        url: `/threads/thread-456/comments/${dummyComment.id}/replies/${dummyReply.id}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual("comment not found");
    });

    it('should response 404 if reply not found in comment', async () => {
        const { accessToken, userId } = await serverTestHelper.getAccessTokenAndUserId();

        await ThreadsTableTestHelper.addThread({ ...dummyThread, owner: userId });
        await CommentsTableTestHelper.addComment({ ...dummyComment, owner: userId });
        await RepliesTableTestHelper.addReply({ ...dummyReply, owner: userId });
        await CommentsTableTestHelper.addComment({ ...dummyComment, id: 'comment-456', owner: userId });

        const response = await server.inject({
            method: 'DELETE',
            url: `/threads/${dummyThread.id}/comments/comment-456/replies/${dummyReply.id}`,
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(404);
        expect(responseJson.status).toEqual('fail');
        expect(responseJson.message).toEqual('reply in comment invalid');
    })

    it('should response 403 if reply owner is not authorized', async () => {
        const { userId } = await serverTestHelper.getAccessTokenAndUserId();

        const { accessToken: otherAccessToken } = await serverTestHelper.getAccessTokenAndUserId({
            username: 'janedoe',
            password: 'Password123',
            fullname: 'Jane Doe',
        })

        await ThreadsTableTestHelper.addThread({ ...dummyThread, owner: userId });
        await CommentsTableTestHelper.addComment({ ...dummyComment, owner: userId });
        await RepliesTableTestHelper.addReply({ ...dummyReply, owner: userId });

        const response = await server.inject({
            method: 'DELETE',
            url: `/threads/${dummyThread.id}/comments/${dummyComment.id}/replies/${dummyReply.id}`,
            headers: { Authorization: `Bearer ${otherAccessToken}` },
        })

        expect(response.statusCode).toEqual(403);
    })

    it('should response 401 if header not contain access token', async () => {
        const { userId } = await serverTestHelper.getAccessTokenAndUserId();

        await ThreadsTableTestHelper.addThread({ ...dummyThread, owner: userId });
        await CommentsTableTestHelper.addComment({ ...dummyComment, owner: userId });
        await RepliesTableTestHelper.addReply({ ...dummyReply, owner: userId });

        const response = await server.inject({
            method: 'DELETE',
            url: `/threads/${dummyThread.id}/comments/${dummyComment.id}/replies/${dummyReply.id}`,
        })

        expect(response.statusCode).toEqual(401);
    })
  });
});
