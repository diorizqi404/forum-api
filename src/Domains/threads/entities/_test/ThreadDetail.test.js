const ThreadDetail = require("../ThreadDetail");

describe("ThreadDetail entities", () => {
  it("should throw error when payload not contain needed property", () => {
    const payload = {
      id: "thread-123",
      title: "A Thread",
      comments: [],
    };

    expect(() => new ThreadDetail(payload)).toThrowError(
      "THREAD_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw error when payload does not meet data type requirements", () => {
    const payload = {
      id: "thread-123",
      title: true,
      body: 123,
      date: 2024,
      username: "A thread user",
      comments: "A thread comments",
    };

    expect(() => new ThreadDetail(payload)).toThrowError(
      "THREAD_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should create ThreadDetail entities correctly", () => {
    const payload = {
      id: "thread-123",
      title: "A Thread",
      body: "A Thread Body",
      date: "2024-01-01T00:00:00Z",
      username: "A thread user",
      comments: [],
    };

    const threadDetail = new ThreadDetail(payload);

    expect(threadDetail).toBeInstanceOf(ThreadDetail);
    expect(threadDetail).toStrictEqual(
      new ThreadDetail({
        id: "thread-123",
        title: "A Thread",
        body: "A Thread Body",
        date: "2024-01-01T00:00:00Z",
        username: "A thread user",
        comments: [],
      })
    );
  });
});
