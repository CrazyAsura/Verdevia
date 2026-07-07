// MongoDB initialization script
// Runs once when the container is first created
// Creates the application database and user with least-privilege access

db = db.getSiblingDB('ecoa');

db.createUser({
  user: 'ecoa_app',
  pwd: process.env.MONGO_APP_PASSWORD || 'ecoa_app_password_dev',
  roles: [
    { role: 'readWrite', db: 'ecoa' },
  ],
});

// Create initial indexes (Mongoose will also ensure these, but explicit is better)
db.forum_posts.createIndex({ title: 'text', content: 'text', tags: 'text' });
db.forum_posts.createIndex({ category: 1, createdAt: -1 });
db.forum_posts.createIndex({ authorId: 1, createdAt: -1 });

db.forum_comments.createIndex({ postId: 1, createdAt: -1 });
db.forum_comments.createIndex({ parentId: 1, createdAt: 1 });

print('✅ MongoDB ECOA database and user created successfully');
