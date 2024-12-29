const NewThread = require("../NewThread");

describe("NewThread entities", () => {
  it("should throw error when payload not contain needed property", () => {
    const payload = {
      title: "A thread",
    };

    expect(() => new NewThread(payload)).toThrowError(
      "NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw error when payload does not meet data type requirements", () => {
    const payload = {
      title: "A thread",
      body: 123,
    };

    expect(() => new NewThread(payload)).toThrowError(
      "NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should create NewThread entities correctly", () => {
    const payload = {
      title: "A thread",
      body: "A thread body",
    };

    const newThread = new NewThread(payload);

    expect(newThread).toBeInstanceOf(NewThread);
    expect(newThread.title).toEqual(payload.title);
    expect(newThread.body).toEqual(payload.body);
  });
});
