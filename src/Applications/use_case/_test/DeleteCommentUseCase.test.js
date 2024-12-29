const DeleteCommentUseCase = require("../DeleteCommentUseCase");
const CommentRepository = require("../../../Domains/comments/CommentRepository");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");

describe("DeleteCommentUseCase", () => {
  it("should orchestrating the delete comment action correctly", async () => {
    const useCaseParams = {
      threadId: "thread-123",
      commentId: "comment-123",
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

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
    mockCommentRepository.verifyCommentOwner = jest.fn(() => Promise.resolve());
    mockCommentRepository.deleteCommentById = jest.fn(() => Promise.resolve());

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    await deleteCommentUseCase.execute("user-123", useCaseParams);

    expect(mockThreadRepository.verifyAvailableThread).toHaveBeenCalledWith(
      useCaseParams.threadId
    );
    expect(mockCommentRepository.checkCommentAvailability).toHaveBeenCalledWith(
      useCaseParams.commentId,
      useCaseParams.threadId
    );
    expect(mockCommentRepository.verifyCommentOwner).toHaveBeenCalledWith(
      useCaseParams.commentId,
      "user-123"
    );
    expect(mockCommentRepository.deleteCommentById).toHaveBeenCalledWith(
      useCaseParams.commentId
    );
  });
});
