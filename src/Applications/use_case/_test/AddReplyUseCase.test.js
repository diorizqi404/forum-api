const AddReplyUseCase = require("../AddReplyUseCase");
const NewReply = require("../../../Domains/replies/entities/NewReply");
const AddedReply = require("../../../Domains/replies/entities/AddedReply");
const ReplyRepository = require("../../../Domains/replies/ReplyRepository");
const CommentRepository = require("../../../Domains/comments/CommentRepository");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");

describe("AddReplyUseCase", () => {
  it("should orchestrating the add reply action correctly", async () => {
    const useCaseParams = {
      threadId: "thread-123",
      commentId: "comment-123",
    };

    const useCasePayload = {
      content: "A reply",
    };

    const mockAddedReply = new AddedReply({
      id: "reply-123",
      content: useCasePayload.content,
      owner: "user-123",
    });

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.verifyAvailableThread = jest.fn(() =>
      Promise.resolve()
    );
    mockCommentRepository.checkCommentAvailability = jest.fn(() =>
      Promise.resolve({
        id: "comment-123",
        threadId: "thread-123",
        is_delete: false,
      })
    );
    mockReplyRepository.addReply = jest.fn(() =>
      Promise.resolve(mockAddedReply)
    );

    const addedReplyUseCase = new AddReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    const addedReply = await addedReplyUseCase.execute(
      "user-123",
      useCaseParams,
      useCasePayload
    );

    expect(addedReply).toStrictEqual(
      new AddedReply({
        id: mockAddedReply.id,
        content: mockAddedReply.content,
        owner: mockAddedReply.owner,
      })
    );

    expect(mockThreadRepository.verifyAvailableThread).toBeCalledWith(
      useCaseParams.threadId
    );
    expect(mockCommentRepository.checkCommentAvailability).toBeCalledWith(
      useCaseParams.commentId,
      useCaseParams.threadId
    );
    expect(mockReplyRepository.addReply).toBeCalledWith(
      "user-123",
      useCaseParams.commentId,
      new NewReply({ content: useCasePayload.content })
    );
  });
});
