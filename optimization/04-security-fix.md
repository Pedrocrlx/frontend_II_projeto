Current actions trust client-provided supabaseId.  
Per spec, identity should come from validated session/JWT server-side.
Actions to apply:
- Remove supabaseId as a client-controlled selector
- Resolve current authenticated user on server
- Enforce tenant boundary by userId/barberShopId from session context only
This is both security and consistency improvement.