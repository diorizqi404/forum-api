const LikeOrDislikeCommentUseCase = require('../LikeOrDislikeCommentUseCase');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentLikeRepository = require('../../../Domains/likes/CommentLikeRepository');
const Like = require('../../../Domains/likes/entities/Like');

describe('LikeOrDislikeCommentUseCase', () => {
    it('should orchectrate the like comment action correctly if comment is not liked', async () => {
        const like = new Like({
            commentId: 'comment-123',
            owner: 'user-123',
        })

        const mockCommentRepository = new CommentRepository();
        const mockThreadRepository = new ThreadRepository();
        const mockCommentLikeRepository = new CommentLikeRepository();

        mockThreadRepository.verifyAvailableThread = jest.fn(() => Promise.resolve());
        mockCommentRepository.checkCommentAvailability = jest.fn(() => Promise.resolve());
        mockCommentLikeRepository.verifyUserCommentLike = jest.fn(() => Promise.resolve());
        mockCommentLikeRepository.addLike = jest.fn(() => Promise.resolve());

        const likeOrDislikeCommentUseCase = new LikeOrDislikeCommentUseCase({
            commentRepository: mockCommentRepository,
            threadRepository: mockThreadRepository,
            commentLikeRepository: mockCommentLikeRepository,
        });

        await likeOrDislikeCommentUseCase.execute('user-123', { threadId: 'thread-123', commentId: 'comment-123' });

        expect(mockThreadRepository.verifyAvailableThread).toBeCalledWith('thread-123');
        expect(mockCommentRepository.checkCommentAvailability).toBeCalledWith('comment-123', 'thread-123');
        expect(mockCommentLikeRepository.verifyUserCommentLike).toBeCalledWith(like);
        expect(mockCommentLikeRepository.addLike).toBeCalledWith(like);
    })

    it('should orchestrating the dislike comment action correctly if comment is liked', async () => {
        const like = new Like({
          commentId: 'comment-123',
          owner: 'user-123',
        });
    
        const mockThreadRepository = new ThreadRepository();
        const mockCommentRepository = new CommentRepository();
        const mockCommentLikeRepository = new CommentLikeRepository();
    
        mockThreadRepository.verifyAvailableThread = jest.fn(() => Promise.resolve());
        mockCommentRepository.checkCommentAvailability = jest.fn(() => Promise.resolve());
        mockCommentLikeRepository.verifyUserCommentLike = jest.fn(() => Promise.resolve(true));
        mockCommentLikeRepository.deleteLike = jest.fn(() => Promise.resolve());
    
        const likeOrDislikeCommentUseCase = new LikeOrDislikeCommentUseCase({
          commentLikeRepository: mockCommentLikeRepository,
          commentRepository: mockCommentRepository,
          threadRepository: mockThreadRepository,
        });
    
        await likeOrDislikeCommentUseCase.execute(
          'user-123',
          {
            threadId: 'thread-123',
            commentId: 'comment-123',
          },
        );
    
        expect(mockThreadRepository.verifyAvailableThread).toBeCalledWith('thread-123');
        expect(mockCommentRepository.checkCommentAvailability).toBeCalledWith('comment-123', 'thread-123');
        expect(mockCommentLikeRepository.verifyUserCommentLike).toBeCalledWith(like);
        expect(mockCommentLikeRepository.deleteLike).toBeCalledWith(like);
      });
})
