Track 3 timings separately for both routes:
- **T_auth_ready**: time until `useAuth().user` is available
- **T_data_fetch**: time for `getShopByUserId(...)`
- **T_total_ui_ready**: page navigation to list rendered
Use `performance.now()` logs (dev only) to identify where delay is worst.
Also test in:
- `bun run dev` (can be misleading)
- production build (`bun run build && bun run start`) for real signal.
