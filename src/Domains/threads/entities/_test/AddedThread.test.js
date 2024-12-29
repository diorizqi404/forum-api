const AddedThread = require("../AddedThread");

describe("AddedThread entities", () => {
  it("should throw error when payload not contain needed property", () => {
    const payload = {
      id: "123",
      title: "A thread",
    };

    expect(() => new AddedThread(payload)).toThrowError(
      "ADDED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw error when payload does not meet data type requirements", () => {
    const payload = {
      id: "123",
      title: "A thread",
      owner: 123,
    };

    expect(() => new AddedThread(payload)).toThrowError(
      "ADDED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should create AddedThread entities correctly", () => {
    const payload = {
      id: "123",
      title: "A thread",
      owner: "thread-owner",
    };

    const addedThread = new AddedThread(payload);

    expect(addedThread).toBeInstanceOf(AddedThread);
    expect(addedThread.id).toEqual(payload.id);
    expect(addedThread.title).toEqual(payload.title);
    expect(addedThread.owner).toEqual(payload.owner);
  });
});
