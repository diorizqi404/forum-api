const CommentLikeRepository = require("../CommentLikeRepository");

describe("CommentLikeRepository interface", () => {
  it("should throw error when invoke abstract behavior", async () => {
    const likeRepository = new CommentLikeRepository();

    await expect(likeRepository.addLike({})).rejects.toThrowError(
      "COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED"
    );
    await expect(likeRepository.getLikesByThreadId("")).rejects.toThrowError(
      "COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED"
    );
    await expect(likeRepository.deleteLike({})).rejects.toThrowError(
      "COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED"
    );
    await expect(likeRepository.verifyUserCommentLike({})).rejects.toThrowError(
      "COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED"
    );
  });
});
