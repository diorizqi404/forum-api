const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const RepliesTableTestHelper = require("../../../../tests/RepliesTableTestHelper");
const pool = require("../../database/postgres/pool");
const ReplyRepositoryPostgres = require("../ReplyRepositoryPostgres");
const NewReply = require("../../../Domains/replies/entities/NewReply");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");
const AuthorizationError = require("../../../Commons/exceptions/AuthorizationError");
const AddedReply = require("../../../Domains/replies/entities/AddedReply");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");

describe("ReplyRepositoryPostgres", () => {
  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("checkReplyAvailability function", () => {
    it("should throw NotFoundError when reply not available", async () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await expect(
        replyRepositoryPostgres.checkReplyAvailability("reply-123")
      ).rejects.toThrowError(new NotFoundError("reply not found"));
    });

    it("should throw NotFoundError when reply is deleted", async () => {
      const userId = "user-123";
      const threadId = "thread-123";
      const commentId = "comment-123";
      const replyId = "reply-123";

      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        thread: threadId,
        owner: userId,
      });
      await RepliesTableTestHelper.addReply({
        id: replyId,
        comment: commentId,
        owner: userId,
        is_delete: true,
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await expect(
        replyRepositoryPostgres.checkReplyAvailability(replyId, commentId)
      ).rejects.toThrowError(new NotFoundError("reply invalid"));
    });
    
    it("should throw NotFoundError when reply is not in comment", async () => {
      const userId = "user-123";
      const threadId = "thread-123";
      const commentId = "comment-123";
      const replyId = "reply-123";

      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        thread: threadId,
        owner: userId,
      });
      await RepliesTableTestHelper.addReply({
        id: replyId,
        comment: commentId,
        owner: userId,
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await expect(
        replyRepositoryPostgres.checkReplyAvailability(replyId, "comment-321")
      ).rejects.toThrowError(new NotFoundError("reply in comment invalid"));
    });

    it("should not throw NotFoundError when reply is available", async () => {
      const userId = "user-123";
      const threadId = "thread-123";
      const commentId = "comment-123";
      const replyId = "reply-123";

      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        thread: threadId,
        owner: userId,
      });
      await RepliesTableTestHelper.addReply({
        id: replyId,
        comment: commentId,
        owner: userId,
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await expect(
        replyRepositoryPostgres.checkReplyAvailability(replyId, commentId)
      ).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe("verifyReplyOwner function", () => {
    it("should throw AuthorizationError when reply owner not authorized", async () => {
      const userId = "user-123";
      const threadId = "thread-123";
      const commentId = "comment-123";
      const replyId = "reply-123";

      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        thread: threadId,
        owner: userId,
      });
      await RepliesTableTestHelper.addReply({
        id: replyId,
        comment: commentId,
        owner: userId,
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await expect(
        replyRepositoryPostgres.verifyReplyOwner(replyId, "user-321")
      ).rejects.toThrowError(new AuthorizationError("user not authorized"));
    });

    it("should not throw AuthorizationError when reply owner authorized", async () => {
      const userId = "user-123";
      const threadId = "thread-123";
      const commentId = "comment-123";
      const replyId = "reply-123";

      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        thread: threadId,
        owner: userId,
      });
      await RepliesTableTestHelper.addReply({
        id: replyId,
        comment: commentId,
        owner: userId,
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await expect(
        replyRepositoryPostgres.verifyReplyOwner(replyId, userId)
      ).resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe("addReply function", () => {
    beforeEach(async () => {
      const userId = "user-123";
      const threadId = "thread-123";
      const commentId = "comment-123";

      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        thread: threadId,
        owner: userId,
      });
    });

    it("should persist new reply", async () => {
      const newReply = new NewReply({ content: "A reply" });

      const fakeIdGenerator = () => "123";
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      await replyRepositoryPostgres.addReply(
        "user-123",
        "comment-123",
        newReply
      );

      const replies = await RepliesTableTestHelper.findRepliesById("reply-123");
      expect(replies).toHaveLength(1);
    });

    it("should return added reply correctly", async () => {
      const newReply = new NewReply({
        content: "A reply",
      });

      const fakeIdGenerator = () => "123";
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      const addedReply = await replyRepositoryPostgres.addReply(
        "user-123",
        "comment-123",
        newReply
      );

      expect(addedReply).toStrictEqual(
        new AddedReply({
          id: "reply-123",
          content: newReply.content,
          owner: "user-123",
        })
      );
    });
  });

  describe("getRepliesByCommentId function", () => {
    it("should return comment replies correctly", async () => {
      const userId = "user-123";
      const threadId = "thread-123";
      const commentId = "comment-123";
      const otherUserId = "user-321";

      await UsersTableTestHelper.addUser({ id: userId, username: "johndoe" });
      await UsersTableTestHelper.addUser({
        id: otherUserId,
        username: "janedoe",
      });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        content: "A comment",
        date: "2024-01-01T10:00:00.000Z",
        thread: threadId,
        owner: userId,
      });

      await RepliesTableTestHelper.addReply({
        id: "reply-123",
        content: "A reply",
        date: "2024-01-01T14:00:00.000Z",
        comment: commentId,
        owner: userId,
      });

      await RepliesTableTestHelper.addReply({
        id: "reply-456",
        content: "A new reply",
        date: "2024-02-02T14:00:00.000Z",
        comment: commentId,
        owner: otherUserId,
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      const replies = await replyRepositoryPostgres.getRepliesByCommentId(
        commentId
      );

      expect(replies).toStrictEqual([
        {
          id: "reply-123",
          content: "A reply",
          date: "2024-01-01T14:00:00.000Z",
          username: "johndoe",
          is_delete: false,
        },
        {
          id: "reply-456",
          content: "A new reply",
          date: "2024-02-02T14:00:00.000Z",
          username: "janedoe",
          is_delete: false,
        },
      ]);
    });
  });

  describe("getRepliesByThreadId", () => {
    it("should return comment replies correctly", async () => {
      const userId = "user-123";
      const otherUserId = "user-456";
      const threadId = "thread-123";
      const commentId = "comment-123";

      await UsersTableTestHelper.addUser({ id: userId, username: "johndoe" });
      await UsersTableTestHelper.addUser({id: otherUserId, username: "janedoe"  });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        content: "A comment",
        date: "2024-01-01T10:00:00.000Z",
        thread: threadId,
        owner: userId,
      });

      await CommentsTableTestHelper.addComment({
        id: "comment-456",
        content: "A new comment",
        date: "2024-02-02T10:00:00.000Z",
        thread: threadId,
        owner: userId,
        is_delete: true,
      });

      await RepliesTableTestHelper.addReply({
        id: "reply-123",
        content: "A reply",
        date: "2024-01-01T14:00:00.000Z",
        comment: commentId,
        owner: userId,
      });

      await RepliesTableTestHelper.addReply({
        id: "reply-456",
        content: "A new reply",
        date: "2024-02-02T14:00:00.000Z",
        comment: commentId,
        owner: otherUserId,
      });

      await RepliesTableTestHelper.addReply({
        id: "reply-789",
        content: "A deleted reply",
        date: "2024-01-01T14:00:00.000Z",
        comment: "comment-456",
        owner: otherUserId,
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      const replies = await replyRepositoryPostgres.getRepliesByThreadId(
        threadId
      );

      expect(replies).toStrictEqual([
        {
          id: "reply-123",
          content: "A reply",
          date: "2024-01-01T14:00:00.000Z",
          comment: "comment-123",
          owner: "user-123",
          username: "johndoe",
          is_delete: false,
        },
        {
          id: "reply-456",
          content: "A new reply",
          date: "2024-02-02T14:00:00.000Z",
          comment: "comment-123",
          owner: "user-456",
          username: "janedoe",
          is_delete: false,
        },
      ]);
    });
  });

  describe("deleteReplyById function", () => {
    it("should soft delete reply and update is_delete field correctly", async () => {
      const userId = "user-123";
      const threadId = "thread-123";
      const commentId = "comment-123";
      const replyId = "reply-123";

      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        thread: threadId,
        owner: userId,
      });
      await RepliesTableTestHelper.addReply({
        id: replyId,
        comment: commentId,
        owner: userId,
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await replyRepositoryPostgres.deleteReplyById(replyId);

      const reply = await RepliesTableTestHelper.findRepliesById(replyId);
      expect(reply).toHaveLength(1);
      expect(reply[0].is_delete).toBeTruthy();
    });
  });
});
