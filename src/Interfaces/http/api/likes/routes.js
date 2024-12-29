const routes = (handler) => ([
    {
      method: 'PUT',
      path: '/threads/{threadId}/comments/{commentId}/likes',
      handler: handler.putLikeHandler,
      options: {
        auth: 'forumjwt',
      },
    },
  ]);
  
  module.exports = routes;