const NotFoundError = require("../../Commons/exceptions/NotFoundError");
const ThreadRepository = require("../../Domains/threads/ThreadRepository");
const AddedThread = require("../../Domains/threads/entities/AddedThread");

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async verifyAvailableThread(threadId) {
    const query = {
      text: "SELECT id FROM threads WHERE id = $1",
      values: [threadId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError("thread not found");
    }
  }

  async addThread(userId, newThread) {
    const { title, body } = newThread;
    const id = `thread-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: "INSERT INTO threads VALUES($1, $2, $3, $4, $5) RETURNING id, title, owner",
      values: [id, title, body, date, userId],
    };
    const result = await this._pool.query(query);
    return new AddedThread(result.rows[0]);
  }

  async getThreadById(threadId) {
    const query = {
        text: 'SELECT threads.id, threads.title, threads.body, threads.date::text, users.username FROM threads JOIN users ON threads.owner = users.id WHERE threads.id = $1',
        values: [threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
        throw new NotFoundError('thread not found');
    }

    return result.rows[0];
  }
}

module.exports = ThreadRepositoryPostgres;