/* eslint-disable camelcase */

exports.up = (pgm) => {
    pgm.createTable('replies', {
      id: {
        type: 'VARCHAR(50)',
        primaryKey: true,
      },
      content: {
        type: 'TEXT',
        notNull: true,
      },
      date: {
        type: 'TEXT',
        notNull: true,
      },
      comment: {
        type: 'VARCHAR(50)',
        notNull: true,
        references: 'comments',
      },
      owner: {
        type: 'VARCHAR(50)',
        notNull: true,
        references: 'users',
      },
      is_delete: {
        type: 'boolean',
        notNull: false,
        default: false,
      },
    });
  };

exports.down = pgm => {
    pgm.dropTable('replies');
};
