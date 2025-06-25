/**
 * RCL Comment Patterns
 */

export const rclCommentRule: any = {
  key: 'comments',
  scope: 'comment.line.number-sign.rcl',
  begin: /#/,
  beginCaptures: {
    '0': { scope: 'punctuation.definition.comment.rcl' },
  },
  end: /$/,
};

export const commentsRepository = {
  comments: rclCommentRule
};

// Optionally, if you want to export the rule directly for specific uses
export const rclCommentPattern = rclCommentRule; 