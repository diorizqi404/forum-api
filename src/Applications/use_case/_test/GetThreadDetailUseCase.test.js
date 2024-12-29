const GetThreadDetailUseCase = require("../GetThreadDetailUseCase");
const ThreadDetail = require("../../../Domains/threads/entities/ThreadDetail");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const CommentRepository = require("../../../Domains/comments/CommentRepository");
const ReplyRepository = require("../../../Domains/replies/ReplyRepository");
const CommentDetail = require("../../../Domains/comments/entities/CommentDetail");
const ReplyDetail = require("../../../Domains/replies/entities/ReplyDetail");
const CommentLikeRepository = require("../../../Domains/likes/CommentLikeRepository");

describe("GetThreadDetailUseCase", () => {
  it("should orchestrating the get thread detail action correctly", async () => {
    const mockThreadDetail = {
      id: "thread-123",
      title: "A thread title",
      body: "A thread body",
      date: "2024-01-01T00:00:00.000Z",
      username: "johndoe",
    };

    const mockComments = [
      {
        id: "comment-1",
        content: "A comment",
        owner: "user-123",
        date: "2024-01-01T00:00:00.000Z",
        is_delete: false,
        username: "janedoe",
      },
      {
        id: "comment-2",
        content: "A deleted comment",
        owner: "user-456",
        date: "2024-01-01T00:00:00.000Z",
        is_delete: true,
        username: "jamesdoe",
      },
    ];

    const mockReplies = [
      {
        id: "reply-1",
        content: "A reply",
        owner: "user-789",
        date: "2024-01-01T00:00:00.000Z",
        comment: "comment-1",
        is_delete: false,
        username: "johndoe",
      },
    ];

    const mockCommentsLikes = [
      {
        id: "like-1",
        comment: "comment-1",
        owner: "user-123",
      },
      {
        id: "like-2",
        comment: "comment-1",
        owner: "user-456",
      },
      {
        id: "like-3",
        comment: "comment-2",
        owner: "user-789",
      },
    ];

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();
    const mockCommentLikeRepository = new CommentLikeRepository();

    mockThreadRepository.getThreadById = jest.fn(() =>
      Promise.resolve(mockThreadDetail)
    );
    mockCommentRepository.getCommentsByThreadId = jest.fn(() =>
      Promise.resolve(mockComments)
    );
    mockReplyRepository.getRepliesByThreadId = jest.fn(() =>
      Promise.resolve(mockReplies)
    );
    mockCommentLikeRepository.getLikesByThreadId = jest.fn(() =>
      Promise.resolve(mockCommentsLikes)
    );

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      commentLikeRepository: mockCommentLikeRepository,
    });

    const threadDetail = await getThreadDetailUseCase.execute("thread-123");

    expect(threadDetail).toStrictEqual(
      new ThreadDetail({
        id: "thread-123",
        title: "A thread title",
        body: "A thread body",
        date: "2024-01-01T00:00:00.000Z",
        username: "johndoe",
        comments: [
          new CommentDetail({
            id: "comment-1",
            username: "janedoe",
            date: "2024-01-01T00:00:00.000Z",
            replies: [
              new ReplyDetail({
                id: "reply-1",
                username: "johndoe",
                content: "A reply",
                date: "2024-01-01T00:00:00.000Z",
              }),
            ],
            content: "A comment",
            likeCount: 2,
          }),
          new CommentDetail({
            id: "comment-2",
            username: "jamesdoe",
            date: "2024-01-01T00:00:00.000Z",
            replies: [],
            content: "**komentar telah dihapus**",
            likeCount: 1,
          }),
        ],
      })
    );
    expect(mockThreadRepository.getThreadById).toBeCalledWith("thread-123");
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(
      "thread-123"
    );
    expect(mockReplyRepository.getRepliesByThreadId).toBeCalledTimes(1);
    expect(mockReplyRepository.getRepliesByThreadId).toBeCalledWith(
      "thread-123"
    );
    expect(mockCommentLikeRepository.getLikesByThreadId).toBeCalledTimes(1);
    expect(mockCommentLikeRepository.getLikesByThreadId).toBeCalledWith(
      "thread-123"
    );
  });
});
