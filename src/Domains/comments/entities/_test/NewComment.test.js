const NewComment = require("../NewComment");

describe("NewComment entities", () => {
  it("should throw error when payload not contain needed property", () => {
    const payload = {
      owner: "A comment owner",
    };

    expect(() => new NewComment(payload)).toThrowError(
      "NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw error when payload does not meet data type requirements", () => {
    const payload = {
      content: 1234,
    };

    expect(() => new NewComment(payload)).toThrowError(
      "NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should create NewComment entities correctly", () => {
    const payload = {
      content: "A comment",
    };

    const newComment = new NewComment(payload);

    expect(newComment).toBeInstanceOf(NewComment);
    expect(newComment.content).toEqual(payload.content);
  });
});
