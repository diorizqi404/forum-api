const UserTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const pool = require("../../database/postgres/pool");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const CommentLikesTableTestHelper = require("../../../../tests/CommentLikesTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const Like = require("../../../Domains/likes/entities/Like");
const CommentLikeRepositoryPostgres = require("../CommentLikeRepositoryPostgres");

describe("CommentLikeRepositoryPostgres", () => {
  afterEach(async () => {
    await CommentLikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UserTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  const dummyUserId = "user-123";
  const dummyThread = {
    id: "thread-123",
    title: "a thread",
    body: "a thread body",
  };
  const dummyComment = {
    id: "comment-123",
    content: "a comment",
    thread: dummyThread.id,
  };

  describe("addLike function", () => {
    it("should add like to database", async () => {
      await UserTableTestHelper.addUser({ id: dummyUserId });
      await ThreadsTableTestHelper.addThread({
        ...dummyThread,
        owner: dummyUserId,
      });
      await CommentsTableTestHelper.addComment({
        ...dummyComment,
        owner: dummyUserId,
      });

      const newLike = new Like({
        commentId: dummyComment.id,
        owner: dummyUserId,
      });

      const fakeIdGenerator = () => "123";
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      await commentLikeRepositoryPostgres.addLike(newLike);

      const likes =
        await CommentLikesTableTestHelper.findLikeByCommentIdAndUserId(
          dummyComment.id,
          dummyUserId
        );

      expect(likes[0]).toStrictEqual({
        id: "like-123",
        comment: dummyComment.id,
        owner: dummyUserId,
      });
    });
  });

  describe("verifyUserCommentLike function", () => {
    it("should return true if user already like the comment", async () => {
      const like = new Like({
        commentId: dummyComment.id,
        owner: dummyUserId,
      });

      await UserTableTestHelper.addUser({ id: dummyUserId });
      await ThreadsTableTestHelper.addThread({
        ...dummyThread,
        owner: dummyUserId,
      });
      await CommentsTableTestHelper.addComment({
        ...dummyComment,
        owner: dummyUserId,
      });
      await CommentLikesTableTestHelper.addLike({ id: "like-123", ...like });

      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(
        pool,
        {}
      );

      const isLike = await commentLikeRepositoryPostgres.verifyUserCommentLike(
        like
      );

      expect(isLike).toEqual(true);
    });

    it("should return false if user has not like the comment", async () => {
      const like = new Like({
        commentId: dummyComment.id,
        owner: dummyUserId,
      });

      await UserTableTestHelper.addUser({ id: dummyUserId });
      await ThreadsTableTestHelper.addThread({
        ...dummyThread,
        owner: dummyUserId,
      });
      await CommentsTableTestHelper.addComment({
        ...dummyComment,
        owner: dummyUserId,
      });

      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(
        pool,
        {}
      );

      const isLike = await commentLikeRepositoryPostgres.verifyUserCommentLike(
        like
      );

      expect(isLike).toEqual(false);
    });
  });

  describe("getLikesByThreadId function", () => {
    it("should return likes for a thread", async () => {
      await UserTableTestHelper.addUser({ id: dummyUserId });
      await ThreadsTableTestHelper.addThread({
        ...dummyThread,
        owner: dummyUserId,
      });
      await CommentsTableTestHelper.addComment({
        ...dummyComment,
        owner: dummyUserId,
      });
      await CommentsTableTestHelper.addComment({
        ...dummyComment,
        id: "comment-456",
        owner: dummyUserId,
      });
      await CommentLikesTableTestHelper.addLike({
        id: "like-1",
        commentId: dummyComment.id,
        owner: dummyUserId,
      });
      await CommentLikesTableTestHelper.addLike({
        id: "like-2",
        commentId: "comment-456",
        owner: dummyUserId,
      });

      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(
        pool,
        {}
      );

      const threadCommentLikes =
        await commentLikeRepositoryPostgres.getLikesByThreadId(dummyThread.id);

      expect(threadCommentLikes).toStrictEqual([
        {
          id: "like-1",
          comment: dummyComment.id,
          owner: dummyUserId,
        },
        {
          id: "like-2",
          comment: "comment-456",
          owner: dummyUserId,
        },
      ]);
    });
  });
  describe("deleteLike function", () => {
    it("should delete like from database", async () => {
      const like = new Like({
        commentId: dummyComment.id,
        owner: dummyUserId,
      });

      await UserTableTestHelper.addUser({ id: dummyUserId });
      await ThreadsTableTestHelper.addThread({
        ...dummyThread,
        owner: dummyUserId,
      });
      await CommentsTableTestHelper.addComment({
        ...dummyComment,
        owner: dummyUserId,
      });
      await CommentLikesTableTestHelper.addLike({ id: "like-123", ...like });

      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(
        pool,
        {}
      );

      await commentLikeRepositoryPostgres.deleteLike(like);

      const likes =
        await CommentLikesTableTestHelper.findLikeByCommentIdAndUserId(
          "like-123"
        );

      expect(likes).toHaveLength(0);
    });
  });
});
