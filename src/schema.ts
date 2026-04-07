import { datetime, int, longtext, mysqlEnum, mysqlTable, primaryKey, text, varchar,} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const users = mysqlTable('users', {
  id: int('id').autoincrement().primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  login: varchar('login', { length: 50 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  email: varchar('email', { length: 100 }).notNull().unique(),
  role: mysqlEnum('role', ['USER', 'ADMIN']).notNull().default('USER'),
  avatar: longtext('avatar'),
  bio: text('bio'),
  isBanned: int('is_banned').notNull().default(0),
  banUntil: datetime('ban_until'),
  createdAt: datetime('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const posts = mysqlTable('posts', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id')
    .notNull()
    .references(() => users.id),
  content: text('content'),
  createdAt: datetime('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const images = mysqlTable('images', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id')
    .notNull()
    .references(() => users.id),
  title: varchar('title', { length: 255 }),
  descriptionText: text('description_text'),
  category: varchar('category', { length: 100 }).notNull(),
  imageBase64: longtext('image_base64').notNull(),
  createdAt: datetime('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  isDeleted: int('is_deleted').notNull().default(0),
});

export const comments = mysqlTable('comments', {
  id: int('id').autoincrement().primaryKey(),
  imageId: int('image_id')
    .notNull()
    .references(() => images.id),
  userId: int('user_id')
    .notNull()
    .references(() => users.id),
  content: text('content').notNull(),
  createdAt: datetime('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  deleted: int('deleted').notNull().default(0),
});

export const likes = mysqlTable(
  'likes',
  {
    imageId: int('image_id')
      .notNull()
      .references(() => images.id),
    userId: int('user_id')
      .notNull()
      .references(() => users.id),
    createdAt: datetime('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.imageId, table.userId] }),
  })
);

export const tags = mysqlTable('tags', {
  id: int('id').autoincrement().primaryKey(),
  nameHashtag: varchar('name_hashtag', { length: 50 }).notNull().unique(),
});

export const imageTags = mysqlTable(
  'image_tags',
  {
    imageId: int('image_id')
      .notNull()
      .references(() => images.id),
    tagId: int('tag_id')
      .notNull()
      .references(() => tags.id),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.imageId, table.tagId] }),
  })
);

export const bans = mysqlTable('bans', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id')
    .notNull()
    .references(() => users.id),
  adminId: int('admin_id')
    .notNull()
    .references(() => users.id),
  reason: text('reason'),
  bannedFrom: datetime('banned_from').notNull(),
  bannedTo: datetime('banned_to').notNull(),
  createdAt: datetime('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});
