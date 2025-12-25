# Debug Session Summary: Contacts and Organizations Not Loading

**Date:** Debug session completed  
**Issue:** Contacts and organizations were not loading in the application  
**Status:** ✅ **RESOLVED**

## Problem Description

The application was unable to load contacts and organizations. Users would navigate to these pages but see no data, with queries appearing to hang indefinitely.

## Root Cause

After extensive debugging with runtime instrumentation, we discovered:

1. **Supabase SDK was hanging** - The `@supabase/supabase-js` SDK queries were timing out after 10 seconds
2. **Session not being loaded by SDK** - Despite `persistSession: true` being configured, the Supabase client was not automatically loading the session from localStorage
3. **Auth methods also hanging** - Attempts to call `supabase.auth.setSession()`, `supabase.auth.getSession()`, and `supabase.auth.getUser()` all hung indefinitely
4. **Direct API calls worked** - When we bypassed the SDK and made direct `fetch()` calls to the Supabase REST API with proper auth headers, queries completed successfully in ~100-200ms

**Conclusion:** The Supabase JavaScript SDK was not functioning correctly in this environment, but the underlying Supabase REST API was working perfectly.

## Debugging Process

### Initial Hypotheses Tested

1. **Hypothesis A:** Service functions not being called
   - **Result:** REJECTED - Service functions were being called

2. **Hypothesis B:** Supabase configuration missing or incorrect
   - **Result:** CONFIRMED - Configuration was correct (URL and keys present)

3. **Hypothesis C:** Query errors from Supabase
   - **Result:** INCONCLUSIVE - Queries never returned, so no errors were received

4. **Hypothesis D:** React Query misconfiguration
   - **Result:** REJECTED - React Query was working correctly

5. **Hypothesis E:** Empty results (no data in database)
   - **Result:** REJECTED - Data exists (confirmed via direct API calls)

6. **Hypothesis F:** Query function not executing
   - **Result:** REJECTED - Query functions were executing

7. **Hypothesis G:** Queries hanging/timing out
   - **Result:** CONFIRMED - Queries were timing out after 10 seconds

8. **Hypothesis H:** Session not set on Supabase client
   - **Result:** CONFIRMED - Session was not being loaded by SDK

9. **Hypothesis I:** Custom fetch wrapper not being used
   - **Result:** CONFIRMED - SDK was not using our custom fetch wrapper

10. **Hypothesis J:** Network connectivity issues
    - **Result:** REJECTED - Direct connectivity test showed server responding in ~100ms

11. **Hypothesis K:** Direct API calls work
    - **Result:** CONFIRMED - Direct fetch calls to Supabase REST API worked perfectly

### Key Findings from Logs

- **Supabase URL:** `https://afjxqxpepdfrwquggipd.supabase.co` (valid)
- **Connectivity:** Server responding with 401 (expected without auth) in ~100ms
- **Session in localStorage:** ✅ Present and valid
- **SDK queries:** ❌ Hanging for 10+ seconds then timing out
- **Direct fetch:** ✅ Completing successfully with status 200 and data

## Solution Implemented

Replaced Supabase SDK queries with direct `fetch()` calls to the Supabase REST API in both:
- `src/features/contacts/services/contactService.ts`
- `src/features/organizations/services/organizationService.ts`

### Implementation Details

1. **Token Retrieval:** Extract access token directly from localStorage (Supabase stores it with keys like `sb-<project-ref>-auth-token`)

2. **Query Building:** Build REST API query strings manually using URLSearchParams:
   - `select=*` for all columns
   - `order=<column>.<asc|desc>` for sorting
   - `offset` and `limit` for pagination
   - Additional filters as needed

3. **Headers:** Include required headers:
   - `apikey`: Supabase anon key
   - `Authorization`: `Bearer <access_token>`
   - `Content-Type`: `application/json`
   - `Prefer`: `count=exact` to get total count

4. **Count Extraction:** Parse `Content-Range` header to get total count for pagination

### Code Pattern

```typescript
// Get access token from localStorage
let accessToken: string | null = null;
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key && key.startsWith('sb-') && key.includes('-auth-token')) {
    const value = localStorage.getItem(key);
    if (value) {
      accessToken = JSON.parse(value).access_token;
      break;
    }
  }
}

// Build query string
const queryParams = new URLSearchParams();
queryParams.set('select', '*');
queryParams.set('order', `${sortBy}.${sortOrder === 'asc' ? 'asc' : 'desc'}`);
queryParams.set('offset', String(from));
queryParams.set('limit', String(pageSize));

// Make direct fetch call
const response = await fetch(`${supabaseUrl}/rest/v1/contacts?${queryParams.toString()}`, {
  headers: {
    'apikey': supabaseKey,
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    'Prefer': 'count=exact',
  }
});

// Extract count from header
const contentRange = response.headers.get('content-range');
if (contentRange) {
  const match = contentRange.match(/\/(\d+)/);
  if (match) {
    count = parseInt(match[1], 10);
  }
}

// Parse response
if (!response.ok) {
  const errorData = await response.json();
  error = { message: errorData.message || 'Query failed', code: response.status };
} else {
  data = await response.json();
}
```

## Results

**Before Fix:**
- Queries: Timing out after 10 seconds
- Data: No data loaded
- User Experience: Pages stuck in loading state

**After Fix:**
- Queries: Completing in ~100-200ms
- Data: Successfully loading (confirmed: 1 contact, 1 organization in test)
- User Experience: Pages loading correctly with data displayed

## Files Modified

1. `src/features/contacts/services/contactService.ts`
   - Replaced `supabase.from('contacts').select()` with direct fetch
   - Removed blocking `getSession()` calls

2. `src/features/organizations/services/organizationService.ts`
   - Replaced `supabase.from('organizations').select()` with direct fetch
   - Removed blocking `getSession()` calls

3. `src/lib/supabase/client.ts`
   - Added custom fetch wrapper (not used by SDK, but kept for reference)
   - Added connectivity test logging

4. `src/features/auth/context/AuthContext.tsx`
   - Removed hanging `setSession()` and `getUser()` calls
   - Relying on localStorage session restoration

5. `src/features/contacts/hooks/useContacts.ts`
   - Added `enabled: initialized && !!user` to wait for auth

6. `src/features/organizations/hooks/useOrganizations.ts`
   - Added `enabled: initialized && !!user` to wait for auth

## Debug Instrumentation

Extensive logging was added throughout the debugging process to track:
- React Query state changes
- Service function execution
- Query execution attempts
- Session availability
- Network connectivity
- Direct API test results

All instrumentation logs are marked with `// #region agent log` and `// #endregion` for easy identification and removal.

## Lessons Learned

1. **SDK can fail silently** - The Supabase SDK can hang without clear error messages
2. **Direct API is reliable** - When SDK fails, direct REST API calls are a viable fallback
3. **Runtime evidence is critical** - Code inspection alone wasn't sufficient; runtime logs revealed the true issue
4. **Session persistence doesn't guarantee SDK loading** - Even with `persistSession: true`, the SDK may not load sessions correctly

## Next Steps (Optional)

1. **Remove debug instrumentation** - Clean up all `// #region agent log` blocks
2. **Consider SDK upgrade** - Investigate if updating `@supabase/supabase-js` resolves the hanging issue
3. **Create abstraction layer** - Consider creating a wrapper that falls back to direct fetch if SDK fails
4. **Monitor performance** - Direct fetch is working, but monitor if SDK issues resolve with updates

## Conclusion

The issue was successfully resolved by bypassing the Supabase JavaScript SDK and using direct REST API calls. The application now loads contacts and organizations correctly. The root cause appears to be a bug or incompatibility in the Supabase SDK version being used, but the workaround is stable and performant.

