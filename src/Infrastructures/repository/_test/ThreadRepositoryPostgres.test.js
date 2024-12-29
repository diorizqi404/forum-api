const ThreadRepositoryPostgres = require("../ThreadRepositoryPostgres");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const pool = require("../../database/postgres/pool");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");
const NewThread = require("../../../Domains/threads/entities/NewThread");
const AddedThread = require("../../../Domains/threads/entities/AddedThread");

describe("ThreadRepositoryPostgres", () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("verifyAvailableThread", () => {
    it("should throw NotFoundError when thread not available", async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      await expect(
        threadRepositoryPostgres.verifyAvailableThread("thread-123")
      ).rejects.toThrowError(new NotFoundError('thread not found'));
    });

    it("should not throw NotFoundError when thread available", async () => {
      const userId = "user-123";
      const threadId = "thread-123";

      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      await expect(
        threadRepositoryPostgres.verifyAvailableThread(threadId)
      ).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe("addThread function", () => {
    beforeEach(async () => {
      await UsersTableTestHelper.addUser({ id: "user-123" });
    });

    it("should persist new thread", async () => {
      const newThread = new NewThread({
        title: "A thread title",
        body: "A thread body",
      });

      const fakeIdGenerator = () => "123";
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      await threadRepositoryPostgres.addThread("user-123", newThread);

      const threads = await ThreadsTableTestHelper.findThreadsById(
        "thread-123"
      );
      expect(threads).toHaveLength(1);
    });

    it("should return added thread correctly", async () => {
      const newThread = new NewThread({
        title: "A thread title",
        body: "A thread body",
      });

      const fakeIdGenerator = () => "123";
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      const addedThread = await threadRepositoryPostgres.addThread(
        "user-123",
        newThread
      );

      expect(addedThread).toStrictEqual(
        new AddedThread({
          id: "thread-123",
          title: newThread.title,
          owner: "user-123",
        })
      );
    });
  });

  describe('getThreadById function', () => {
    it('should throw NotFoundError when thread not available', async () => {
        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
    
        await expect(threadRepositoryPostgres.getThreadById('thread-123')).rejects.toThrowError(NotFoundError);
    })

    it('should return thread correctly', async () => {
        const userId = 'user-123'
        const threadId = 'thread-123'
        const date = new Date().toISOString()

        await UsersTableTestHelper.addUser({ id: userId, username: 'johndoe' })
        await ThreadsTableTestHelper.addThread({
            id: threadId,
            title: 'A thread title',
            body: 'A thread body',
            date,
            owner: userId
        })

        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {})

        const thread = await threadRepositoryPostgres.getThreadById(threadId)
        
        expect(thread).toStrictEqual({
          id: threadId,
          title: 'A thread title',
          body: 'A thread body',
          date,
          username: 'johndoe',
        });
    })
  })
});
