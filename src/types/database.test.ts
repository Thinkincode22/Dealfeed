import { describe, it, expect } from 'vitest';
import { transformDBDealToDeal } from './database';
import type { DBDealRow } from './database';

describe('transformDBDealToDeal', () => {
    const baseDeal: DBDealRow = {
        id: 'deal-1',
        title: 'Test Deal',
        description: 'A test deal',
        price: 99.99,
        original_price: 149.99,
        discount: 33,
        image_url: 'https://example.com/image.jpg',
        store: 'TestStore',
        store_url: 'https://example.com',
        category: 'Electronics',
        temperature: 42,
        created_at: '2024-01-15T10:30:00Z',
        expires_at: '2024-12-31T23:59:59Z',
        coupon_code: 'SAVE30',
        shipping_info: 'Free shipping',
        is_active: true,
        author: { username: 'testuser', avatar_url: 'https://example.com/avatar.jpg' },
        comments: [
            {
                id: 'comment-1',
                content: 'Great deal!',
                created_at: '2024-01-16T08:00:00Z',
                author: { username: 'commenter', avatar_url: 'https://example.com/commenter.jpg' },
            },
        ],
    };

    it('transforms a complete deal correctly', () => {
        const result = transformDBDealToDeal(baseDeal);

        expect(result.id).toBe('deal-1');
        expect(result.title).toBe('Test Deal');
        expect(result.description).toBe('A test deal');
        expect(result.price).toBe(99.99);
        expect(result.originalPrice).toBe(149.99);
        expect(result.discount).toBe(33);
        expect(result.image).toBe('https://example.com/image.jpg');
        expect(result.store).toBe('TestStore');
        expect(result.storeUrl).toBe('https://example.com');
        expect(result.category).toBe('Electronics');
        expect(result.temperature).toBe(42);
        expect(result.couponCode).toBe('SAVE30');
        expect(result.shippingInfo).toBe('Free shipping');
    });

    it('sets upvotes and downvotes to 0', () => {
        const result = transformDBDealToDeal(baseDeal);
        expect(result.upvotes).toBe(0);
        expect(result.downvotes).toBe(0);
    });

    it('transforms author correctly', () => {
        const result = transformDBDealToDeal(baseDeal);
        expect(result.author.username).toBe('testuser');
        expect(result.author.avatar).toBe('https://example.com/avatar.jpg');
    });

    it('transforms comments correctly', () => {
        const result = transformDBDealToDeal(baseDeal);
        expect(result.comments).toHaveLength(1);
        expect(result.comments[0].id).toBe('comment-1');
        expect(result.comments[0].content).toBe('Great deal!');
        expect(result.comments[0].author.username).toBe('commenter');
        expect(result.comments[0].upvotes).toBe(0);
        expect(result.comments[0].downvotes).toBe(0);
    });

    it('parses dates correctly', () => {
        const result = transformDBDealToDeal(baseDeal);
        expect(result.createdAt).toBeInstanceOf(Date);
        expect(result.createdAt.toISOString()).toBe('2024-01-15T10:30:00.000Z');
        expect(result.expiresAt).toBeInstanceOf(Date);
        expect(result.expiresAt?.toISOString()).toBe('2024-12-31T23:59:59.000Z');
    });

    it('handles missing optional fields with defaults', () => {
        const minimalDeal: DBDealRow = {
            id: 'deal-min',
            title: 'Minimal Deal',
            price: 10,
        };

        const result = transformDBDealToDeal(minimalDeal);

        expect(result.description).toBe('');
        expect(result.originalPrice).toBe(10);
        expect(result.discount).toBe(0);
        expect(result.image).toBe('');
        expect(result.store).toBe('');
        expect(result.storeUrl).toBe('');
        expect(result.category).toBe('Other');
        expect(result.temperature).toBe(0);
        expect(result.expiresAt).toBeUndefined();
        expect(result.couponCode).toBeUndefined();
        expect(result.shippingInfo).toBeUndefined();
        expect(result.author.username).toBe('Anonymous');
        expect(result.author.avatar).toBe('');
        expect(result.comments).toEqual([]);
    });

    it('uses current date when created_at is missing', () => {
        const dealWithoutDate: DBDealRow = {
            id: 'deal-no-date',
            title: 'No Date Deal',
            price: 5,
        };

        const before = new Date();
        const result = transformDBDealToDeal(dealWithoutDate);
        const after = new Date();

        expect(result.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
        expect(result.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('handles comments with missing author data', () => {
        const dealWithAnonymousComment: DBDealRow = {
            ...baseDeal,
            comments: [
                {
                    id: 'comment-anon',
                    content: 'Anonymous comment',
                    created_at: '2024-01-17T12:00:00Z',
                },
            ],
        };

        const result = transformDBDealToDeal(dealWithAnonymousComment);
        expect(result.comments[0].author.username).toBe('Anonymous');
        expect(result.comments[0].author.avatar).toBe('');
    });

    it('handles numeric string price', () => {
        const dealWithStringPrice: DBDealRow = {
            ...baseDeal,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            price: '199.99' as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            original_price: '299.99' as any,
        };

        const result = transformDBDealToDeal(dealWithStringPrice);
        expect(result.price).toBe(199.99);
        expect(result.originalPrice).toBe(299.99);
    });
});
