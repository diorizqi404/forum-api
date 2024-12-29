const AddedComment = require("../AddedComment");

describe("AddedComment", () => {
  it("should thrown error when payload not contain needed property", () => {
    const payload = {
      id: "comment-123",
      content: "A comment",
    };

    expect(() => new AddedComment(payload)).toThrowError(
      "ADDED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should thrown error when payload does not meet data type requirements", () => {
    const payload = {
      id: "comment-123",
      content: [],
      owner: 123,
    };

    expect(() => new AddedComment(payload)).toThrowError(
      "ADDED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should create AddedComment entities correctly", () => {
    const payload = {
      id: "comment-123",
      content: "A comment",
      owner: "comment-owner",
    };

    const addedComment = new AddedComment(payload);

    expect(addedComment).toBeInstanceOf(AddedComment);
    expect(addedComment.id).toEqual(payload.id);
    expect(addedComment.content).toEqual(payload.content);
    expect(addedComment.owner).toEqual(payload.owner);
  });
});
