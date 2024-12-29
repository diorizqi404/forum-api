const NotFoundError = require("../../Commons/exceptions/NotFoundError");
const AuthorizationError = require("../../Commons/exceptions/AuthorizationError");
const AddedReply = require("../../Domains/replies/entities/AddedReply");
const ReplyRepository = require("../../Domains/replies/ReplyRepository");

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async checkReplyAvailability(replyId, commentId) {
    const query = {
      text: "SELECT id, comment, is_delete FROM replies WHERE id = $1",
      values: [replyId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("reply not found");
    }

    const reply = result.rows[0];

    if (result.rows[0].is_delete) {
      throw new NotFoundError("reply invalid");
    }

    if (reply.comment !== commentId) {
      throw new NotFoundError("reply in comment invalid");
    }
  }

  async verifyReplyOwner(replyId, owner) {
    const query = {
      text: "SELECT owner FROM replies WHERE id = $1",
      values: [replyId],
    };

    const result = await this._pool.query(query);
    const reply = result.rows[0];

    if (reply.owner !== owner) {
      throw new AuthorizationError("user not authorized");
    }
  }

  async addReply(userId, commentId, newReply) {
    const { content } = newReply;
    const id = `reply-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: "INSERT INTO replies(id, content, date, comment, owner, is_delete) VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner",
      values: [id, content, date, commentId, userId, false],
    };

    const result = await this._pool.query(query);

    return new AddedReply(result.rows[0]);
  }

  async getRepliesByCommentId(commentId) {
    const query = {
      text: `SELECT replies.id, users.username, replies.date, replies.content, replies.is_delete  FROM replies JOIN users ON users.id = replies.owner WHERE replies.comment = $1 ORDER BY replies.date ASC`,
      values: [commentId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async getRepliesByThreadId(threadId) {
    const query = {
      text: "SELECT replies.*, users.username FROM replies JOIN users ON users.id = replies.owner JOIN comments ON comments.id = replies.comment WHERE comments.thread = $1 AND comments.is_delete = false ORDER BY replies.date ASC",
      values: [threadId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async deleteReplyById(replyId) {
    const query = {
      text: "UPDATE replies SET is_delete = true WHERE id = $1",
      values: [replyId],
    };

    await this._pool.query(query);
  }
}

module.exports = ReplyRepositoryPostgres;
