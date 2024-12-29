const UserTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const pool = require("../../database/postgres/pool");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const CommentRepositoryPostgres = require("../CommentRepositoryPostgres");
const NewComment = require("../../../Domains/comments/entities/NewComment");
const AddedComment = require("../../../Domains/comments/entities/AddedComment");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");
const AuthorizationError = require("../../../Commons/exceptions/AuthorizationError");

describe("CommentRepositoryPostgres", () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UserTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("checkCommentAvailability function", () => {
    it("should throw NotFoundError when comment not available", async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(
        commentRepositoryPostgres.checkCommentAvailability(
          "comment-123",
          "thread-123"
        )
      ).rejects.toThrowError(new NotFoundError("comment not found"));
    });

    it("should throw NotFoundError when comment is deleted", async () => {
      const userId = "user-123";
      const threadId = "thread-123";
      const commentId = "comment-123";

      await UserTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        thread: threadId,
        owner: userId,
        is_delete: true,
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(
        commentRepositoryPostgres.checkCommentAvailability(commentId, threadId)
      ).rejects.toThrowError(new NotFoundError("comment invalid"));
    });

    it("should not throw NotFoundError when comment available", async () => {
      const userId = "user-123";
      const threadId = "thread-123";
      const commentId = "comment-123";

      await UserTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        thread: threadId,
        owner: userId,
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      const comment = await commentRepositoryPostgres.checkCommentAvailability(commentId, threadId)

      expect(comment).toStrictEqual({
        id: commentId,
        thread: threadId,
        is_delete: false,
      });
    });
  });

  describe("verifyCommentOwner function", () => {
    it("should throw AuthorizationError when comment owner not authorized", async () => {
      const userId = "user-123";
      const threadId = "thread-123";
      const commentId = "comment-123";

      await UserTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        thread: threadId,
        owner: userId,
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(
        commentRepositoryPostgres.verifyCommentOwner(commentId, "user-124")
      ).rejects.toThrowError(
        new AuthorizationError("you are not authorized to access this resource")
      );
    });

    it("should not throw AuthorizationError when comment owner authorized", async () => {
      const userId = "user-123";
      const threadId = "thread-123";
      const commentId = "comment-123";

      await UserTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        thread: threadId,
        owner: userId,
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(
        commentRepositoryPostgres.verifyCommentOwner(commentId, userId)
      ).resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe("addComment function", () => {
    beforeEach(async () => {
      await UserTableTestHelper.addUser({ id: "user-123" });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: "user-123",
      });
    });

    it("should persist new comment", async () => {
      const newComment = new NewComment({
        content: "A comment",
      });

      const fakeIdGenerator = () => "123";
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      await commentRepositoryPostgres.addComment(
        "user-123",
        "thread-123",
        newComment
      );

      const comment = await CommentsTableTestHelper.findCommentsById("comment-123")

      expect(comment).toHaveLength(1);
    });

    it("should return added comment correctly", async () => {
      const newComment = new NewComment({
        content: "A comment",
      });

      const fakeIdGenerator = () => "123";
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      const addedComment = await commentRepositoryPostgres.addComment(
        "user-123",
        "thread-123",
        newComment
      );

      expect(addedComment).toStrictEqual(
        new AddedComment({
          id: "comment-123",
          content: "A comment",
          owner: "user-123",
        })
      );
    });
  });

  describe("getCommentByThreadId function", () => {
    it("should return comment correctly", async () => {
      const userId = "user-123";
      const threadId = "thread-123";
      const otherUserId = "user-124";

      await UserTableTestHelper.addUser({ id: userId, username: "johndoe" });
      await UserTableTestHelper.addUser({
        id: otherUserId,
        username: "janedoe",
      });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });

      await CommentsTableTestHelper.addComment({
        id: "comment-123",
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
        owner: otherUserId,
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      const comments = await commentRepositoryPostgres.getCommentsByThreadId(
        threadId
      );

      expect(comments).toStrictEqual([
        {
          id: "comment-123",
          content: "A comment",
          date: "2024-01-01T10:00:00.000Z",
          username: "johndoe",
          owner: userId,
          is_delete: false,
        },
        {
          id: "comment-456",
          content: "A new comment",
          date: "2024-02-02T10:00:00.000Z",
          username: "janedoe",
          owner: otherUserId,
          is_delete: false,
        },
      ]);
    });
  });

  describe("deleteCommentById function", () => {
    it("should soft delete comment and update is_delete field correctly", async () => {
      await UserTableTestHelper.addUser({ id: "user-123" });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        owner: "user-123",
      });

      const commentId = "comment-123";
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await CommentsTableTestHelper.addComment({
        id: commentId,
        thread: "thread-123",
        owner: "user-123",
      });

      await commentRepositoryPostgres.deleteCommentById(commentId);

      const comments = await CommentsTableTestHelper.findCommentsById(
        commentId
      );
      await expect(comments).toHaveLength(1);
      await expect(comments[0].is_delete).toBeTruthy();
    });
  });
});
