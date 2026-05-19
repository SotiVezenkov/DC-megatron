## Prerequisites

Before running the application, make sure the following are installed:

- Node.js 18 or newer
- npm
- Git

Check versions:

```bash
node -v
npm -v
git --version
```

## How to run the application

Clone the repository:

```bash
git clone https://github.com/SotiVezenkov/DC-megatron.git
cd DC-megatron
```

### Start the backend

Go to the backend folder:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Start the application:

```bash
npm run dev
```

The app runs on:

```
http://localhost:3000
```

The SQLite database file is created automatically when the backend starts:

```
backend/database.sqlite
```

This file is ignored by Git.
