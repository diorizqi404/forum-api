class CommentDetail {
  constructor(payload) {
    this._verifyPayload(payload);
    const { id, username, date, replies, content, likeCount, is_delete } =
      payload;
    this.id = id;
    this.username = username;
    this.date = date;
    this.replies = replies;
    this.content = is_delete ? "**komentar telah dihapus**" : content;
    this.likeCount = likeCount;
  }

  _verifyPayload({ id, username, date, replies, content, likeCount }) {
    if (
      !id ||
      !username ||
      !date ||
      !replies ||
      !content ||
      likeCount === undefined
    ) {
      throw new Error("COMMENT_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY");
    }

    if (
      typeof id !== "string" ||
      typeof username !== "string" ||
      typeof date !== "string" ||
      !Array.isArray(replies) ||
      typeof content !== "string" ||
      typeof likeCount !== "number"
    ) {
      throw new Error("COMMENT_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION");
    }
  }
}

module.exports = CommentDetail;
