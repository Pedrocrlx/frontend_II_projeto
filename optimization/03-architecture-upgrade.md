Refactor dashboard list pages to server-first data loading:
- Use a server component wrapper for /dashboard/barbers and /dashboard/services
- Resolve user/session server-side
- Fetch shop + related data server-side
- Pass initial data into a client component for interactions (drawer/edit/delete)
This removes the blank “wait for auth then wait for fetch” waterfall.
Expected: much faster first meaningful paint.