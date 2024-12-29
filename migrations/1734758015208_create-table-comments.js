/* eslint-disable camelcase */

exports.up = pgm => {
    pgm.createTable('comments', {
        id: {
            type: 'VARCHAR(50)',
            primaryKey: true
        },
        content: {
            type: 'TEXT',
            notNull: true
        },
        thread: {
            type: 'VARCHAR(50)',
            notNull: true,
            references: 'threads(id)',
            onDelete: 'cascade'
        },
        owner: {
            type: 'VARCHAR(50)',
            notNull: true,
            references: 'users(id)',
            onDelete: 'cascade'
        },
        date: {
            type: 'TEXT',
            notNull: true
        },
        is_delete: {
            type: 'BOOLEAN',
            notNull: true,
            default: false
        }
    });
};

exports.down = pgm => {
    pgm.dropTable('comments');
};

exports.down = pgm => {
    pgm.dropTable('comments');
};
