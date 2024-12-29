const NotFoundError = require("../../Commons/exceptions/NotFoundError");
const AuthorizationError = require("../../Commons/exceptions/AuthorizationError");
const AddedComment = require("../../Domains/comments/entities/AddedComment");
const CommentRepository = require("../../Domains/comments/CommentRepository");

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async checkCommentAvailability(commentId, threadId) {
    const query = {
      text: "SELECT id, thread, is_delete FROM comments WHERE id = $1 AND thread = $2",
      values: [commentId, threadId],
    };

    const { rows, rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError("comment not found");
    }

    if (rows[0].is_delete) {
      throw new NotFoundError("comment invalid");
    }

    return rows[0];
  }

  async verifyCommentOwner(commentId, owner) {
    const query = {
      text: "SELECT owner FROM comments WHERE id = $1",
      values: [commentId],
    };

    const result = await this._pool.query(query);
    const comment = result.rows[0];

    if (comment.owner !== owner) {
      throw new AuthorizationError(
        "you are not authorized to access this resource"
      );
    }
  }

  async addComment(userId, threadId, newComment) {
    const { content } = newComment;
    const id = `comment-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: "INSERT INTO comments VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner",
      values: [id, content, threadId, userId, date],
    };

    const result = await this._pool.query(query);

    return new AddedComment(result.rows[0]);
  }

  async getCommentsByThreadId(threadId) {
    const query = {
      text: "SELECT comments.id, comments.content, comments.owner, comments.date::text, comments.is_delete, users.username FROM comments JOIN users ON comments.owner = users.id WHERE comments.thread = $1 ORDER BY comments.date ASC",
      values: [threadId],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  async deleteCommentById(commentId) {
    const query = {
      text: "UPDATE comments SET is_delete = true WHERE id = $1",
      values: [commentId],
    };

    await this._pool.query(query);
  }
}

module.exports = CommentRepositoryPostgres;
