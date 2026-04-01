1. Prevent duplicate calls in dev
   - Guard against repeated fetch calls from Strict Mode behavior.
2. Parallelize/short-circuit where possible
   - Don’t wait on unnecessary state transitions before fetch.
3. Optimistic local updates after create/edit/delete
   - Update local state immediately, then reconcile in background.
   - Avoid full fetchShopData() after every mutation.
4. Stabilize toasts + loading UX
   - Keep skeletons lightweight and avoid reflow-heavy transitions.
Expected: noticeable UX improvement without major refactor.