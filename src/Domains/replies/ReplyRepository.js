class ReplyRepository {
  async addReply() {
    throw new Error("REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }

  async checkReplyAvailability() {
    throw new Error("REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }

  async getRepliesByCommentId() {
    throw new Error("REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }

  async getRepliesByThreadId() {
    throw new Error("REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }

  async deleteReplyById() {
    throw new Error("REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }

  async verifyReplyOwner() {
    throw new Error("REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED");
  }
}

module.exports = ReplyRepository;
