const pool = require('../../database/postgres/pool');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const CommentLikesTableTestHelper = require('../../../../tests/CommentLikesTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');

describe('comment likes endpoint', () => {
    let server
    let serverTestHelper

    beforeAll(async () => {
        server = await createServer(container);
        serverTestHelper = new ServerTestHelper(server);
    });

    afterAll(async () => {
        await pool.end();
    });

    afterEach(async () => {
        await CommentLikesTableTestHelper.cleanTable();
        await CommentsTableTestHelper.cleanTable();
        await ThreadsTableTestHelper.cleanTable();
        await UsersTableTestHelper.cleanTable();
        await AuthenticationsTableTestHelper.cleanTable();
    })

    const dummyThread = {
        id: 'thread-123',
        title: 'a thread',
        body: 'a body',
        date: new Date().toISOString(),
    }

    const dummyComment = {
        id: 'comment-123',
        content: 'a comment',
        date: new Date().toISOString(),
        threadId: 'thread-123',
        is_delete: false,
    }

    describe('when PUT /threads/{threadId}/comments/{commentId}/likes', () => {
        it('should response 200 and like comment if comment is not liked before', async () => {
            const { accessToken, userId } = await serverTestHelper.getAccessTokenAndUserId();

            await ThreadsTableTestHelper.addThread({ ...dummyThread, owner: userId });
            await CommentsTableTestHelper.addComment({ ...dummyComment, owner: userId });

            const response = await server.inject({
                method: 'PUT',
                url: `/threads/${dummyThread.id}/comments/${dummyComment.id}/likes`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(200);
            expect(responseJson.status).toEqual('success');

            const likes = await CommentLikesTableTestHelper.findLikeByCommentIdAndUserId(dummyComment.id, userId);
            expect(likes).toHaveLength(1);
        })

        it('should response 200 and unlike comment if comment is liked before', async () => {
            const { accessToken, userId } = await serverTestHelper.getAccessTokenAndUserId();

            await ThreadsTableTestHelper.addThread({ ...dummyThread, owner: userId });
            await CommentsTableTestHelper.addComment({ ...dummyComment, owner: userId });
            await CommentLikesTableTestHelper.addLike({ commentId: dummyComment.id, owner: userId });

            const response = await server.inject({
                method: 'PUT',
                url: `/threads/${dummyThread.id}/comments/${dummyComment.id}/likes`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(200);
            expect(responseJson.status).toEqual('success');

            const likes = await CommentLikesTableTestHelper.findLikeByCommentIdAndUserId(dummyComment.id, userId);
            expect(likes).toHaveLength(0);
        })

        it('should response 404 if liked comment is not found in thread', async () => {
            const { accessToken, userId } = await serverTestHelper.getAccessTokenAndUserId();

            await ThreadsTableTestHelper.addThread({ ...dummyThread, owner: userId });
            await CommentsTableTestHelper.addComment({ ...dummyComment, owner: userId });
            await ThreadsTableTestHelper.addThread({ ...dummyThread, id: 'thread-456', owner: userId });

            const response = await server.inject({
                method: 'PUT',
                url: `/threads/thread-456/comments/${dummyComment.id}/likes`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(404);
            expect(responseJson.status).toEqual('fail');
            expect(responseJson.message).toEqual('comment not found');
        })

        it('should response 404 if comment not found', async () => {
            const { accessToken, userId } = await serverTestHelper.getAccessTokenAndUserId();

            await ThreadsTableTestHelper.addThread({ ...dummyThread, owner: userId });

            const response = await server.inject({
                method: 'PUT',
                url: `/threads/${dummyThread.id}/comments/comment-456/likes`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(404);
            expect(responseJson.status).toEqual('fail');
            expect(responseJson.message).toEqual('comment not found');
        })

        it('should response 404 if comment invalid or deleted', async () => {
            const { accessToken, userId } = await serverTestHelper.getAccessTokenAndUserId();

            await ThreadsTableTestHelper.addThread({ ...dummyThread, owner: userId });
            await CommentsTableTestHelper.addComment({ ...dummyComment, owner: userId });

            await server.inject({
                method: 'DELETE',
                url: `/threads/${dummyThread.id}/comments/${dummyComment.id}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            })

            const response = await server.inject({
                method: 'PUT',
                url: `/threads/${dummyThread.id}/comments/${dummyComment.id}/likes`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(404);
            expect(responseJson.status).toEqual('fail');
            expect(responseJson.message).toEqual('comment invalid');
        })

        it('should response 404 if thread not found', async () => {
            const { accessToken } = await serverTestHelper.getAccessTokenAndUserId();

            const response = await server.inject({
                method: 'PUT',
                url: '/threads/thread-456/comments/comment-456/likes',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(404);
            expect(responseJson.status).toEqual('fail');
            expect(responseJson.message).toEqual('thread not found');
        })

        it('should response 401 if header not contain access token', async () => {
            const { userId } = await serverTestHelper.getAccessTokenAndUserId();

            await ThreadsTableTestHelper.addThread({ ...dummyThread, owner: userId });
            await CommentsTableTestHelper.addComment({ ...dummyComment, owner: userId });

            const response = await server.inject({
                method: 'PUT',
                url: `/threads/${dummyThread.id}/comments/${dummyComment.id}/likes`,
            });

            expect(response.statusCode).toEqual(401);
        })
    })
})