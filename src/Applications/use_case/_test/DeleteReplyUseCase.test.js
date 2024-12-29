const DeleteReplyUseCase = require("../DeleteReplyUseCase");
const ReplyRepository = require("../../../Domains/replies/ReplyRepository");
const CommentRepository = require("../../../Domains/comments/CommentRepository");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");

describe("DeleteReplyUseCase", () => {
  it("should orchestrating the delete comment action correctly", async () => {
    const useCaseParams = {
      threadId: "thread-123",
      commentId: "comment-123",
      replyId: "reply-123",
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.verifyAvailableThread = jest.fn(() =>
      Promise.resolve()
    );
    mockCommentRepository.checkCommentAvailability = jest.fn(() =>
      Promise.resolve({
        id: "comment-123",
        thread: "thread-123",
        is_delete: false,
      })
    );
    mockReplyRepository.checkReplyAvailability = jest.fn(() =>
      Promise.resolve()
    );
    mockReplyRepository.verifyReplyOwner = jest.fn(() => Promise.resolve());
    mockReplyRepository.deleteReplyById = jest.fn(() => Promise.resolve());

    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    await deleteReplyUseCase.execute("user-123", useCaseParams);

    expect(mockThreadRepository.verifyAvailableThread).toHaveBeenCalledWith(
      useCaseParams.threadId
    );
    expect(mockCommentRepository.checkCommentAvailability).toHaveBeenCalledWith(
      useCaseParams.commentId,
      useCaseParams.threadId
    );
    expect(mockReplyRepository.checkReplyAvailability).toHaveBeenCalledWith(
      useCaseParams.replyId,
      useCaseParams.commentId
    );
    expect(mockReplyRepository.verifyReplyOwner).toHaveBeenCalledWith(
      useCaseParams.replyId,
      "user-123"
    );
    expect(mockReplyRepository.deleteReplyById).toHaveBeenCalledWith(
      useCaseParams.replyId
    );
  });
});
