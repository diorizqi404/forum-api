const NewComment = require("../../Domains/comments/entities/NewComment");

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(userId, threadId, useCasePayload) {
    await this._threadRepository.verifyAvailableThread(threadId);
    const newComment = new NewComment(useCasePayload);
    return this._commentRepository.addComment(userId, threadId, newComment);
  }
}

module.exports = AddCommentUseCase;
