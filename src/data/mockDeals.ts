import type { Deal } from '../types/deal';

export const mockDeals: Deal[] = [
    {
        id: '1',
        title: 'Apple AirPods Pro (2nd Gen)',
        description: 'The latest AirPods Pro with improved noise cancellation and sound quality. Perfect for daily commute and focus work.',
        price: 199,
        originalPrice: 249,
        discount: 20,
        image: 'https://images.unsplash.com/photo-1603351154351-5cf2330819dd?q=80&w=1000&auto=format&fit=crop',
        store: 'Amazon',
        storeUrl: 'https://amazon.com',
        category: 'Electronics',
        upvotes: 342,
        downvotes: 12,
        comments: [
            {
                id: 'c1',
                author: { username: 'AudioFan', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Max' },
                content: 'Great price! Just bought a pair.',
                createdAt: new Date('2024-03-20T10:30:00Z'),
                upvotes: 5,
                downvotes: 0
            },
            {
                id: 'c2',
                author: { username: 'DealHunter', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
                content: 'Is this the USB-C version?',
                createdAt: new Date('2024-03-20T11:00:00Z'),
                upvotes: 2,
                downvotes: 0
            }
        ],
        temperature: 330,
        createdAt: new Date('2024-03-20T10:00:00Z'),
        author: {
            username: 'TechHunter',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'
        }
    },
    {
        id: '2',
        title: 'LG OLED C3 55" 4K TV',
        description: 'Experience self-lit pixels with the LG OLED evo C3. Infinite contrast and 100% color volume for cinematic viewing.',
        price: 1299,
        originalPrice: 1799,
        discount: 28,
        image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=1000&auto=format&fit=crop',
        store: 'Best Buy',
        storeUrl: 'https://bestbuy.com',
        category: 'Electronics',
        upvotes: 521,
        downvotes: 40,
        comments: [],
        temperature: 481,
        createdAt: new Date('2024-03-19T15:30:00Z'),
        author: {
            username: 'CinemaLover',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka'
        }
    },
    {
        id: '3',
        title: 'Lenovo ThinkPad X1 Carbon Gen 11',
        description: 'Ultralight business powerhouse with Intel Core i7, 32GB RAM, and 1TB SSD. Built for productivity anywhere.',
        price: 1499,
        originalPrice: 2299,
        discount: 35,
        image: 'https://images.unsplash.com/photo-1593642632823-8f78536788c6?q=80&w=1000&auto=format&fit=crop',
        store: 'Lenovo',
        storeUrl: 'https://lenovo.com',
        category: 'Electronics',
        upvotes: 215,
        downvotes: 5,
        comments: [],
        temperature: 210,
        createdAt: new Date('2024-03-18T09:15:00Z'),
        author: {
            username: 'BizPro',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Darius'
        }
    },
    {
        id: '4',
        title: 'Herman Miller Aeron Chair',
        description: 'The benchmark for ergonomic seating. Fully adjustable and breathable mesh for all-day comfort.',
        price: 1100,
        originalPrice: 1650,
        discount: 33,
        image: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?q=80&w=1000&auto=format&fit=crop',
        store: 'Herman Miller',
        storeUrl: 'https://hermanmiller.com',
        category: 'Home',
        upvotes: 890,
        downvotes: 15,
        comments: [],
        temperature: 875,
        createdAt: new Date('2024-03-21T08:00:00Z'),
        author: {
            username: 'OfficeSetup',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bella'
        }
    },
    {
        id: '5',
        title: 'Sony WH-1000XM5 Headphones',
        description: 'Industry-leading noise cancellation and exceptional sound quality with up to 30-hour battery life.',
        price: 348,
        originalPrice: 399,
        discount: 13,
        image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=1000&auto=format&fit=crop',
        store: 'Amazon',
        storeUrl: 'https://amazon.com',
        category: 'Electronics',
        upvotes: 456,
        downvotes: 23,
        comments: [],
        temperature: 433,
        createdAt: new Date('2024-03-17T14:45:00Z'),
        author: {
            username: 'AudioPhile',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John'
        }
    }
];
