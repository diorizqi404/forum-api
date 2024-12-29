const NewReply = require("../NewReply");

describe("NewReply entity", () => {
  it("should throw error when payload not contain needed property", () => {
    const payload = {};

    expect(() => new NewReply(payload)).toThrowError(
      "NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw error when payload not meet data type specification", () => {
    const payload = {
      content: 1234,
    };

    expect(() => new NewReply(payload)).toThrowError(
      "NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should create NewReply object correctly", () => {
    const payload = {
      content: "A reply",
    };

    const newReply = new NewReply(payload);

    expect(newReply).toBeInstanceOf(NewReply);
    expect(newReply.content).toEqual(payload.content);
  });
});
