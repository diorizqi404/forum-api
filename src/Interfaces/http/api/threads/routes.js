const routes = (handler) => ([
    {
        method: 'POST',
        path: '/threads',
        handler: handler.postThreadHandler,
        options: {
            auth: 'forumjwt'
        }
    },
    {
        method: 'GET',
        path: '/threads/{threadId}',
        handler: handler.getThreadByIdHandler,
    }
])

module.exports = routes;