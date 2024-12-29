const routes = (handler) => ([
    {
      method: 'POST',
      path: '/threads/{threadId}/comments',
      handler: handler.postCommentHandler,
      options: {
        auth: 'forumjwt',
      },
    },
    {
      method: 'DELETE',
      path: '/threads/{threadId}/comments/{commentId}',
      handler: handler.deleteCommentByIdHandler,
      options: {
        auth: 'forumjwt',
      },
    },
  ]);
  
module.exports = routes;