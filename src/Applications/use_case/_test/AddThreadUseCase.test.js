const AddThreadUseCase = require("../AddThreadUseCase");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const AddedThread = require("../../../Domains/threads/entities/AddedThread");
const NewThread = require("../../../Domains/threads/entities/NewThread");

describe("AddThreadUseCase", () => {
  it("should orchestrating the add thread action correctly", async () => {
    const useCasePayload = {
      title: "A thread title",
      body: "A thread body",
    };

    const mockAddedThread = new AddedThread({
      id: "thread-123",
      title: useCasePayload.title,
      owner: "user-123",
    });

    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.addThread = jest.fn(() =>
      Promise.resolve(mockAddedThread)
    );

    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    const addedThread = await addThreadUseCase.execute(
      "user-123",
      useCasePayload
    );

    expect(addedThread).toStrictEqual(
      new AddedThread({
        id: "thread-123",
        title: useCasePayload.title,
        owner: "user-123",
      })
    );

    expect(mockThreadRepository.addThread).toBeCalledWith(
      "user-123",
      new NewThread({
        title: useCasePayload.title,
        body: useCasePayload.body,
      })
    );
  });
});
