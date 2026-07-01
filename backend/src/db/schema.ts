import { mysqlTable, int, varchar, timestamp, mysqlEnum, time, date, boolean, text } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 150 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  role: mysqlEnum('role', ['admin', 'user']).default('user'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const rooms = mysqlTable('rooms', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 150 }).notNull().unique(),
  location: varchar('location', { length: 200 }),
  capacity: int('capacity').notNull(),
  description: text('description'),
  openTime: time('open_time').notNull().default('08:00:00'),
  closeTime: time('close_time').notNull().default('17:00:00'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const reservations = mysqlTable('reservations', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id').notNull().references(() => users.id),
  roomId: int('room_id').notNull().references(() => rooms.id),
  date: date('date').notNull(),
  startTime: time('start_time').notNull(),
  endTime: time('end_time').notNull(),
  purpose: varchar('purpose', { length: 255 }).notNull(),
  status: mysqlEnum('status', ['pending', 'approved', 'rejected', 'cancelled']).default('pending'),
  rejectReason: varchar('reject_reason', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const notifications = mysqlTable('notifications', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id').notNull().references(() => users.id),
  message: varchar('message', { length: 255 }).notNull(),
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});
