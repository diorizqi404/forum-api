const ReplyDetail = require('../ReplyDetail');

describe('ReplyDetail entity', () => {
    it('should throw error when payload does not contain needed property', () => {
        const payload = {
            id: 'reply-123',
            username: 'johndoe'
        };

        expect(() => new ReplyDetail(payload)).toThrowError('REPLY_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
    })

    it('should throw error when payload does not meet data type specification', () => {
        const payload = {
            id: 'reply-123',
            content: 12345,
            date: 2024,
            username: 'johndoe'
        }

        expect(() => new ReplyDetail(payload)).toThrowError('REPLY_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
    })

    it('should create ReplyDetail object correctly', () => {
        const payload = {
            id: 'reply-123',
            content: 'A reply',
            date: '2021-08-08T07:22:33Z',
            username: 'johndoe'
        }

        const replyDetail = new ReplyDetail(payload);

        expect(replyDetail).toBeInstanceOf(ReplyDetail);
        expect(replyDetail.id).toEqual(payload.id);
        expect(replyDetail.content).toEqual(payload.content);
        expect(replyDetail.date).toEqual(payload.date);
        expect(replyDetail.username).toEqual(payload.username);
    })

    it('should create deleted ReplyDetail entities correctly', () => {
        const payload = {
            id: 'reply-123',
            content: 'A reply',
            date: '2021-08-08T07:22:33Z',
            username: 'johndoe',
            is_delete: true
        }

        const replyDetail = new ReplyDetail(payload);

        expect(replyDetail).toBeInstanceOf(ReplyDetail);
        expect(replyDetail.id).toEqual(payload.id);
        expect(replyDetail.content).toEqual('**balasan telah dihapus**');
        expect(replyDetail.date).toEqual(payload.date);
        expect(replyDetail.username).toEqual(payload.username);
    })
})