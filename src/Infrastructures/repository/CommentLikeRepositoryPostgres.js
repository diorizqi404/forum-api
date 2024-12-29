const CommentLikeRepository = require("../../Domains/likes/CommentLikeRepository");

class CommentLikeRepositoryPostgres extends CommentLikeRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addLike(like) {
    const { commentId, owner } = like;
    const id = `like-${this._idGenerator()}`;

    const query = {
      text: "INSERT INTO user_comment_likes (id, comment, owner) VALUES ($1, $2, $3)",
      values: [id, commentId, owner],
    };

    await this._pool.query(query);
  }

  async getLikesByThreadId(threadId) {
    const query = {
      text: `SELECT ucl.* FROM user_comment_likes ucl
            JOIN comments c ON ucl.comment = c.id
            WHERE c.thread = $1`,
      values: [threadId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async verifyUserCommentLike(like) {
    const { commentId, owner } = like;
    const query = {
      text: "SELECT 1 FROM user_comment_likes WHERE comment = $1 AND owner = $2",
      values: [commentId, owner],
    };

    const result = await this._pool.query(query);
    return result.rows.length > 0;
  }

  async deleteLike(like) {
    const { commentId, owner } = like;
    const query = {
      text: "DELETE FROM user_comment_likes WHERE comment = $1 AND owner = $2",
      values: [commentId, owner],
    };

    await this._pool.query(query);
  }
}

module.exports = CommentLikeRepositoryPostgres;
