const routes = (handler) => [
    {
      method: "POST",
      path: "/threads/{threadId}/comments/{commentId}/replies",
      handler: handler.postReplyHandler,
      options: {
        auth: "forumjwt",
      },
    },
    {
      method: "DELETE",
      path: "/threads/{threadId}/comments/{commentId}/replies/{replyId}",
      handler: handler.deleteReplyByIdHandler,
      options: {
        auth: "forumjwt",
      },
    },
  ];
  
  module.exports = routes;
  