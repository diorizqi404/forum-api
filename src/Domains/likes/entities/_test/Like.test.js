const Like = require("../Like");

describe("a Like entity", () => {
  it("should throw error when payload did not contain needed property", () => {
    const payload = {
      commentId: "comment-123",
    };

    expect(() => new Like(payload)).toThrowError(
      "LIKE.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw error when payload did not meet data type specification", () => {
    const payload = {
      commentId: 123,
      owner: true,
    };

    expect(() => new Like(payload)).toThrowError(
      "LIKE.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should create Like object correctly", () => {
    const payload = {
      commentId: "comment-123",
      owner: "user-123",
    };

    const newLike = new Like(payload);

    expect(newLike.commentId).toEqual(payload.commentId);
    expect(newLike.owner).toEqual(payload.owner);
  });
});
