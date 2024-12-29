const CommentDetail = require("../CommentDetail");

describe("a CommentDetail entities", () => {
  it("should throw error when payload not contain needed property", () => {
    const payload = {
      id: "comment-123",
      content: "A comment",
    };

    expect(() => new CommentDetail(payload)).toThrowError(
      "COMMENT_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw error when payload does not meet data type requirements", () => {
    const payload = {
      id: "comment-123",
      username: "a username",
      date: 2024,
      replies: "replies",
      content: "A comment",
      likeCount: 0,
    };

    expect(() => new CommentDetail(payload)).toThrowError(
      "COMMENT_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should create CommentDetail entities correctly", () => {
    const payload = {
      id: "comment-123",
      username: "johndoe",
      date: "2024-01-22T01:50:00.000Z",
      replies: [
        {
          id: "reply-123",
          content: "A reply",
          date: "2024-01-22T01:50:00.000Z",
          username: "janedoe",
        },
      ],
      content: "A comment",
      likeCount: 0,
    };

    const commentDetail = new CommentDetail(payload);

    expect(commentDetail).toBeInstanceOf(CommentDetail);
    expect(commentDetail.id).toEqual(payload.id);
    expect(commentDetail.username).toEqual(payload.username);
    expect(commentDetail.date).toEqual(payload.date);
    expect(commentDetail.replies).toEqual(payload.replies);
    expect(commentDetail.content).toEqual(payload.content);
  });

  it("should create deleted CommentDetail entities correctly", () => {
    const payload = {
      id: "comment-123",
      username: "johndoe",
      date: "2024-01-22T01:50:00.000Z",
      replies: [
        {
          id: "reply-123",
          content: "A reply",
          date: "2024-01-22T01:50:00.000Z",
          username: "janedoe",
        },
      ],
      content: "A comment",
      likeCount: 0,
      is_delete: true,
    };

    const commentDetail = new CommentDetail(payload);

    expect(commentDetail).toBeInstanceOf(CommentDetail);
    expect(commentDetail.id).toEqual(payload.id);
    expect(commentDetail.username).toEqual(payload.username);
    expect(commentDetail.date).toEqual(payload.date);
    expect(commentDetail.replies).toEqual(payload.replies);
    expect(commentDetail.content).toEqual("**komentar telah dihapus**");
  });
});
