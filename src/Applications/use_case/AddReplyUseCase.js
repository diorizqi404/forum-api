const NewReply = require("../../Domains/replies/entities/NewReply");

class AddReplyUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(userId, useCaseParams, useCasePayload) {
    const { threadId, commentId } = useCaseParams;
    const newReply = new NewReply(useCasePayload);
    await this._threadRepository.verifyAvailableThread(threadId);
    await this._commentRepository.checkCommentAvailability(commentId, threadId);
    return this._replyRepository.addReply(userId, commentId, newReply);
  }
}

module.exports = AddReplyUseCase;
