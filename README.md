# Incit Auth Backend

Backend service for authentication system built with Express.js, TypeScript, and MySQL.

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8 or higher)
- npm or yarn

## Setup Instructions

1. **Install Dependencies**

```bash
npm install
```

## Available Scripts

- `npm run dev` - Start development server with hot-reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run migrate:make` - Create new migration
- `npm run migrate:latest` - Run all pending migrations
- `npm run migrate:rollback` - Rollback last migration
- `npm run migrate:rollback:all` - Rollback all migrations
- `npm run migrate:status` - Show migration status

## Common Migration Commands

1. **Create New Migration**

```bash
npm run migrate:make create_users_table
```

2. **Run Migrations**

**Run all pending migrations**

```bash
npm run migrate:latest
```

**Check Migration Status**

```bash
npm run migrate:status
```

3. **Rollback Migrations**

**Rollback last batch**

```bash
npm run migrate:rollback
```

**Rollback all migrations**

```bash
npm run migrate:rollback:all
```

**Reset (rollback all and migrate latest)**

```bash
npm run migrate:reset
```

4. **Troubleshooting Migrations**

**Check current migration status**

```bash
npm run migrate:status
```

**Reset database and run all migrations**

```bash
npm run migrate:reset
```


## Development Guidelines

1. Always create a new migration for database changes
2. Test migrations both up and down
3. Use meaningful migration names (e.g., create_users_table, add_user_role_column)
4. Keep migrations idempotent when possible
5. Add appropriate indexes for frequently queried columns