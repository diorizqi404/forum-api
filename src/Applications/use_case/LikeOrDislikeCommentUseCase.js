const Like = require("../../Domains/likes/entities/Like");

class LikeOrDislikeCommentUseCase {
  constructor({ commentRepository, threadRepository, commentLikeRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
    this._commentLikeRepository = commentLikeRepository;
  }

  async execute(userId, useCaseParams) {
    const { threadId, commentId } = useCaseParams;
    await this._threadRepository.verifyAvailableThread(threadId);
    await this._commentRepository.checkCommentAvailability(commentId, threadId);

    const like = new Like({
      commentId,
      owner: userId,
    });

    const isLiked = await this._commentLikeRepository.verifyUserCommentLike(
      like
    );

    return (await isLiked)
      ? this._commentLikeRepository.deleteLike(like)
      : this._commentLikeRepository.addLike(like);
  }
}

module.exports = LikeOrDislikeCommentUseCase;
