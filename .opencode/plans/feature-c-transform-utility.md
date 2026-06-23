# Dealfeed Improvement Plan

## C: Shared Transform Utility

### Step 1: Add to `src/types/database.ts`

Add import and export function:

```ts
import type { Deal } from './deal';

export const transformDBDealToDeal = (deal: DBDealRow): Deal => ({
    id: deal.id,
    title: deal.title,
    description: deal.description || '',
    price: Number(deal.price),
    originalPrice: Number(deal.original_price) || Number(deal.price),
    discount: deal.discount || 0,
    image: deal.image_url || '',
    store: deal.store || '',
    storeUrl: deal.store_url || '',
    category: deal.category || 'Other',
    upvotes: 0,
    downvotes: 0,
    temperature: deal.temperature || 0,
    createdAt: new Date(deal.created_at ?? new Date().toISOString()),
    expiresAt: deal.expires_at ? new Date(deal.expires_at) : undefined,
    couponCode: deal.coupon_code,
    shippingInfo: deal.shipping_info,
    author: {
        username: deal.author?.username || 'Anonymous',
        avatar: deal.author?.avatar_url || '',
    },
    comments: (deal.comments || []).map((comment: DBCommentRow) => ({
        id: comment.id,
        content: comment.content,
        createdAt: new Date(comment.created_at ?? new Date().toISOString()),
        upvotes: 0,
        downvotes: 0,
        author: {
            username: comment.author?.username || 'Anonymous',
            avatar: comment.author?.avatar_url || '',
        },
    })),
});
```

### Step 2: Update `src/hooks/useDeals.ts`

- Add import: `import { transformDBDealToDeal } from '../types/database';`
- Remove `transformDeals` function (lines 26-61)
- Replace `transformDeals(data || [])` with `(data || []).map(transformDBDealToDeal)`

### Step 3: Update `src/pages/DealPage.tsx`

- Add import: `import { transformDBDealToDeal } from '../types/database';`
- Replace lines 50-83 with: `setFetchedDeal(transformDBDealToDeal(data));`

### Step 4: Update `src/pages/ProfilePage.tsx`

- Add import: `import { transformDBDealToDeal } from '../types/database';`
- Replace lines 34-71 with:
```ts
const transformed: Deal[] = (data || [])
    .map((row: any) => row.deals ? transformDBDealToDeal(row.deals) : null)
    .filter(Boolean) as Deal[];
```

### Step 5: Type-check

```bash
npx tsc --noEmit
```
