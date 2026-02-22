"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Seeding database...');
    // Create demo users
    const hashedPassword = await bcryptjs_1.default.hash('password123', 10);
    const users = await Promise.all([
        prisma.user.upsert({
            where: { email: 'sarah.rn@example.com' },
            update: {},
            create: {
                email: 'sarah.rn@example.com',
                password: hashedPassword,
                name: 'Sarah Johnson, RN',
                role: 'SELLER',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
                balance: 1850
            }
        }),
        prisma.user.upsert({
            where: { email: 'mike.np@example.com' },
            update: {},
            create: {
                email: 'mike.np@example.com',
                password: hashedPassword,
                name: 'Dr. Mike Chen, NP',
                role: 'SELLER',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
                balance: 3240
            }
        }),
        prisma.user.upsert({
            where: { email: 'emma.student@example.com' },
            update: {},
            create: {
                email: 'emma.student@example.com',
                password: hashedPassword,
                name: 'Emma Rodriguez',
                role: 'BUYER',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma',
                balance: 150
            }
        })
    ]);
    console.log(`✅ Created ${users.length} users`);
    // Create sample documents
    const documents = await Promise.all([
        prisma.document.upsert({
            where: { id: 'doc-1' },
            update: {},
            create: {
                id: 'doc-1',
                title: 'Complete NCLEX-RN Study Guide 2024',
                description: 'Comprehensive 500+ page NCLEX-RN study guide covering all major content areas including Safe and Effective Care Environment, Health Promotion and Maintenance, Psychosocial Integrity, and Physiological Integrity. Includes practice questions and test-taking strategies.',
                category: 'nclex-prep',
                level: 'graduate',
                subject: 'Fundamentals',
                price: 39.99,
                originalPrice: 59.99,
                fileUrl: 'sample-nclex-guide.pdf',
                fileType: 'PDF',
                fileSize: 8500000,
                fileName: 'NCLEX-RN-Study-Guide-2024.pdf',
                pageCount: 520,
                wordCount: 125000,
                previewPages: 25,
                thumbnailUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=300&fit=crop',
                sellerId: users[0].id,
                status: 'APPROVED',
                rating: 4.9,
                reviewCount: 127,
                salesCount: 892,
                tags: JSON.stringify(['NCLEX', 'RN', 'nursing exam', 'test prep', 'study guide']),
                isFeatured: true,
                isBestseller: true
            }
        }),
        prisma.document.upsert({
            where: { id: 'doc-2' },
            update: {},
            create: {
                id: 'doc-2',
                title: 'Pharmacology Drug Cards - 200+ Medications',
                description: 'Complete drug card set covering the most commonly tested medications on the NCLEX. Each card includes drug class, mechanism of action, indications, contraindications, side effects, nursing considerations, and patient education.',
                category: 'drug-cards',
                level: 'undergraduate',
                subject: 'Pharmacology',
                price: 24.99,
                fileUrl: 'sample-drug-cards.pdf',
                fileType: 'PDF',
                fileSize: 4200000,
                fileName: 'Pharmacology-Drug-Cards.pdf',
                pageCount: 210,
                wordCount: 45000,
                previewPages: 15,
                thumbnailUrl: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400&h=300&fit=crop',
                sellerId: users[1].id,
                status: 'APPROVED',
                rating: 4.8,
                reviewCount: 89,
                salesCount: 567,
                tags: JSON.stringify(['pharmacology', 'drug cards', 'medications', 'flashcards']),
                isFeatured: true
            }
        }),
        prisma.document.upsert({
            where: { id: 'doc-3' },
            update: {},
            create: {
                id: 'doc-3',
                title: 'Med-Surg Nursing Care Plans Bundle',
                description: '50+ comprehensive nursing care plans for common medical-surgical conditions. Includes NANDA diagnoses, SMART goals, interventions with rationales, and evaluation criteria.',
                category: 'care-plans',
                level: 'undergraduate',
                subject: 'Medical-Surgical',
                price: 29.99,
                originalPrice: 44.99,
                fileUrl: 'sample-care-plans.pdf',
                fileType: 'PDF',
                fileSize: 6800000,
                fileName: 'Med-Surg-Care-Plans.pdf',
                pageCount: 180,
                wordCount: 55000,
                previewPages: 10,
                thumbnailUrl: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=400&h=300&fit=crop',
                sellerId: users[0].id,
                status: 'APPROVED',
                rating: 4.9,
                reviewCount: 156,
                salesCount: 723,
                tags: JSON.stringify(['care plans', 'med-surg', 'nursing diagnosis', 'interventions']),
                isBestseller: true
            }
        })
    ]);
    console.log(`✅ Created ${documents.length} documents`);
    console.log('✅ Database seeded successfully!');
}
main()
    .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map