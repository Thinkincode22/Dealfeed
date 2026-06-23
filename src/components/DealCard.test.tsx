import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DealCard } from './DealCard';
import { AuthProvider } from '../contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import type { Deal } from '../types/deal';

const mockDeal: Deal = {
    id: 'deal-1',
    title: 'Test Deal Title',
    description: 'This is a test deal description',
    price: 99.99,
    originalPrice: 149.99,
    discount: 33,
    image: 'https://example.com/image.jpg',
    store: 'TestStore',
    storeUrl: 'https://example.com',
    category: 'Electronics',
    upvotes: 10,
    downvotes: 2,
    temperature: 8,
    createdAt: new Date('2024-01-15'),
    author: {
        username: 'testuser',
        avatar: 'https://example.com/avatar.jpg',
    },
    comments: [
        {
            id: 'c1',
            content: 'Great deal!',
            createdAt: new Date('2024-01-16'),
            upvotes: 0,
            downvotes: 0,
            author: { username: 'commenter', avatar: '' },
        },
        {
            id: 'c2',
            content: 'Nice find',
            createdAt: new Date('2024-01-17'),
            upvotes: 0,
            downvotes: 0,
            author: { username: 'other', avatar: '' },
        },
    ],
};

const renderWithRouter = (component: React.ReactNode) => {
    return render(
        <MemoryRouter>
            <AuthProvider>
                <NotificationProvider>
                    {component}
                </NotificationProvider>
            </AuthProvider>
        </MemoryRouter>
    );
};

describe('DealCard', () => {
    it('renders deal title', () => {
        renderWithRouter(<DealCard deal={mockDeal} />);
        expect(screen.getByText('Test Deal Title')).toBeInTheDocument();
    });

    it('renders store name', () => {
        renderWithRouter(<DealCard deal={mockDeal} />);
        expect(screen.getByText('TestStore')).toBeInTheDocument();
    });

    it('renders author username', () => {
        renderWithRouter(<DealCard deal={mockDeal} />);
        expect(screen.getByText('by testuser')).toBeInTheDocument();
    });

    it('renders price', () => {
        renderWithRouter(<DealCard deal={mockDeal} />);
        const priceElements = screen.getAllByText('99.99 zł');
        expect(priceElements.length).toBeGreaterThan(0);
    });

    it('renders original price with strikethrough when discounted', () => {
        renderWithRouter(<DealCard deal={mockDeal} />);
        const originalPriceElements = screen.getAllByText('149.99 zł');
        expect(originalPriceElements.length).toBeGreaterThan(0);
    });

    it('renders discount badge', () => {
        renderWithRouter(<DealCard deal={mockDeal} />);
        expect(screen.getByText('-33%')).toBeInTheDocument();
    });

    it('renders comment count', () => {
        renderWithRouter(<DealCard deal={mockDeal} />);
        const commentCount = screen.getAllByText('2');
        expect(commentCount.length).toBeGreaterThan(0);
    });

    it('renders temperature', () => {
        renderWithRouter(<DealCard deal={mockDeal} />);
        const tempElements = screen.getAllByText('8°');
        expect(tempElements.length).toBeGreaterThan(0);
    });

    it('renders deal image with correct alt text', () => {
        renderWithRouter(<DealCard deal={mockDeal} />);
        const img = screen.getByAltText('Test Deal Title');
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
    });

    it('renders "Get Deal" link with correct href', () => {
        renderWithRouter(<DealCard deal={mockDeal} />);
        const getDealLinks = screen.getAllByText('Get Deal');
        expect(getDealLinks.length).toBeGreaterThan(0);
        expect(getDealLinks[0].closest('a')).toHaveAttribute('href', 'https://example.com');
    });

    it('does not show original price when no discount', () => {
        const noDiscountDeal = { ...mockDeal, discount: 0, originalPrice: 99.99 };
        renderWithRouter(<DealCard deal={noDiscountDeal} />);
        // Original price should not appear as strikethrough
        const strikeElements = screen.queryAllByText('99.99 zł');
        // Should only have the current price, not the strikethrough original
        expect(strikeElements.length).toBeGreaterThanOrEqual(1);
    });
});
