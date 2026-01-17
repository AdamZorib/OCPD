import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '@prisma/client';

// Path relative to prisma folder where seed.ts is located
const adapter = new PrismaBetterSqlite3({ url: "file:./prisma/dev.db" });
const prisma = new PrismaClient({ adapter });

// Helper functions
const daysFromNow = (days: number): Date => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
};

const daysAgo = (days: number): Date => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
};

async function main() {
    console.log('🌱 Seeding database...');

    // Clear existing data
    await prisma.claim.deleteMany();
    await prisma.policy.deleteMany();
    await prisma.quote.deleteMany();
    await prisma.client.deleteMany();

    // Seed Clients
    const clients = await Promise.all([
        prisma.client.create({
            data: {
                id: 'client-1',
                nip: '5213456789',
                name: 'Trans-Europa Sp. z o.o.',
                email: 'biuro@trans-europa.pl',
                phone: '+48 22 123 45 67',
                street: 'ul. Transportowa 15',
                city: 'Warszawa',
                postalCode: '02-495',
                voivodeship: 'mazowieckie',
                regonDataJson: JSON.stringify({
                    nip: '5213456789',
                    regon: '123456789',
                    name: 'Trans-Europa Sp. z o.o.',
                    shortName: 'Trans-Europa',
                    address: {
                        street: 'ul. Transportowa 15',
                        city: 'Warszawa',
                        postalCode: '02-495',
                        voivodeship: 'mazowieckie',
                    },
                    pkdCodes: ['49.41.Z', '52.29.C'],
                    registrationDate: '2010-03-15',
                    employeeCount: '50-99',
                    legalForm: 'Sp. z o.o.',
                }),
                riskProfileJson: JSON.stringify({
                    overallScore: 72,
                    riskLevel: 'MEDIUM',
                    yearsInBusiness: 14,
                    claimsRatio: 0.35,
                    bonusMalus: -10,
                    transportTypes: ['ADR', 'Plandeki', 'Chłodnie'],
                    mainRoutes: ['POLAND', 'EUROPE'],
                    hasADRCertificate: true,
                    hasTAPACertificate: false,
                }),
                fleetJson: '[]',
                claimsHistoryJson: '[]',
                brokerId: 'dev-broker',
            },
        }),
        prisma.client.create({
            data: {
                id: 'client-2',
                nip: '7891234567',
                name: 'Szybki Transport Kowalski',
                email: 'jan@szybkitransport.pl',
                phone: '+48 605 111 222',
                street: 'ul. Główna 5',
                city: 'Poznań',
                postalCode: '60-001',
                voivodeship: 'wielkopolskie',
                riskProfileJson: JSON.stringify({
                    overallScore: 85,
                    riskLevel: 'LOW',
                    yearsInBusiness: 6,
                    claimsRatio: 0.15,
                    bonusMalus: -20,
                    transportTypes: ['Plandeki'],
                    mainRoutes: ['POLAND'],
                    hasADRCertificate: false,
                    hasTAPACertificate: false,
                }),
                brokerId: 'dev-broker',
            },
        }),
        prisma.client.create({
            data: {
                id: 'client-3',
                nip: '1234567890',
                name: 'Logistyka Międzynarodowa SA',
                email: 'kontakt@logistyka-miedzynarodowa.pl',
                phone: '+48 12 345 67 89',
                street: 'ul. Logistyczna 100',
                city: 'Kraków',
                postalCode: '30-001',
                voivodeship: 'małopolskie',
                riskProfileJson: JSON.stringify({
                    overallScore: 68,
                    riskLevel: 'MEDIUM',
                    yearsInBusiness: 19,
                    claimsRatio: 0.42,
                    bonusMalus: 0,
                    transportTypes: ['ADR', 'Plandeki', 'Chłodnie', 'Ciężkie'],
                    mainRoutes: ['POLAND', 'EUROPE', 'WORLD'],
                    hasADRCertificate: true,
                    hasTAPACertificate: true,
                }),
                brokerId: 'dev-broker',
            },
        }),
        prisma.client.create({
            data: {
                id: 'client-4',
                nip: '9876543210',
                name: 'Fresh Cold Transport Sp. z o.o.',
                email: 'info@freshcold.pl',
                phone: '+48 58 999 88 77',
                street: 'ul. Mroźna 22',
                city: 'Gdańsk',
                postalCode: '80-001',
                voivodeship: 'pomorskie',
                riskProfileJson: JSON.stringify({
                    overallScore: 55,
                    riskLevel: 'HIGH',
                    yearsInBusiness: 5,
                    claimsRatio: 0.65,
                    bonusMalus: 15,
                    transportTypes: ['Chłodnie'],
                    mainRoutes: ['EUROPE'],
                    hasADRCertificate: false,
                    hasTAPACertificate: false,
                }),
                brokerId: 'dev-broker',
            },
        }),
    ]);
    console.log(`✅ Created ${clients.length} clients`);

    // Seed Policies
    const policies = await Promise.all([
        prisma.policy.create({
            data: {
                id: 'policy-1',
                policyNumber: 'OCPD/2024/001234',
                clientId: 'client-1',
                clientNIP: '5213456789',
                clientName: 'Trans-Europa Sp. z o.o.',
                type: 'OCPD',
                status: 'ACTIVE',
                sumInsured: 500000,
                territorialScope: 'EUROPE',
                basePremium: 6000,
                clausesPremium: 2800,
                totalPremium: 8800,
                clausesJson: JSON.stringify([
                    { id: 'clause-1', type: 'GROSS_NEGLIGENCE', name: 'Rażące niedbalstwo', sublimit: 500000, premium: 1200, isActive: true },
                    { id: 'clause-2', type: 'PARKING', name: 'Klauzula postojowa', sublimit: 250000, premium: 1600, isActive: true },
                ]),
                validFrom: daysAgo(180),
                validTo: daysFromNow(185),
                issuedAt: daysAgo(180),
                apkCompleted: true,
                ipidGenerated: true,
                brokerId: 'dev-broker',
            },
        }),
        prisma.policy.create({
            data: {
                id: 'policy-2',
                policyNumber: 'OCPD/2024/001235',
                clientId: 'client-2',
                clientNIP: '7891234567',
                clientName: 'Szybki Transport Kowalski',
                type: 'OCPD',
                status: 'ACTIVE',
                sumInsured: 200000,
                territorialScope: 'POLAND',
                basePremium: 1600,
                clausesPremium: 320,
                totalPremium: 1920,
                validFrom: daysAgo(90),
                validTo: daysFromNow(275),
                issuedAt: daysAgo(90),
                apkCompleted: true,
                ipidGenerated: true,
                brokerId: 'dev-broker',
            },
        }),
        prisma.policy.create({
            data: {
                id: 'policy-3',
                policyNumber: 'OCPD/2024/001236',
                clientId: 'client-3',
                clientNIP: '1234567890',
                clientName: 'Logistyka Międzynarodowa SA',
                type: 'OCPD',
                status: 'ACTIVE',
                sumInsured: 1000000,
                territorialScope: 'WORLD',
                basePremium: 18000,
                clausesPremium: 11340,
                totalPremium: 29340,
                validFrom: daysAgo(60),
                validTo: daysFromNow(305),
                issuedAt: daysAgo(60),
                apkCompleted: true,
                ipidGenerated: true,
                brokerId: 'dev-broker',
            },
        }),
        prisma.policy.create({
            data: {
                id: 'policy-4',
                policyNumber: 'OCPD/2024/001237',
                clientId: 'client-4',
                clientNIP: '9876543210',
                clientName: 'Fresh Cold Transport Sp. z o.o.',
                type: 'OCPD',
                status: 'ACTIVE',
                sumInsured: 300000,
                territorialScope: 'EUROPE',
                basePremium: 3600,
                clausesPremium: 900,
                totalPremium: 4500,
                validFrom: daysAgo(330),
                validTo: daysFromNow(35),
                issuedAt: daysAgo(330),
                apkCompleted: true,
                ipidGenerated: true,
                brokerId: 'dev-broker',
            },
        }),
    ]);
    console.log(`✅ Created ${policies.length} policies`);

    // Seed Claims
    const claims = await Promise.all([
        prisma.claim.create({
            data: {
                id: 'claim-1',
                claimNumber: 'SZK/2024/00123',
                policyId: 'policy-1',
                clientId: 'client-1',
                incidentDate: daysAgo(45),
                reportedDate: daysAgo(43),
                description: 'Uszkodzenie ładunku elektroniki podczas transportu z Niemiec.',
                location: 'A2, okolice Poznania',
                claimedAmount: 85000,
                reservedAmount: 75000,
                status: 'UNDER_REVIEW',
            },
        }),
        prisma.claim.create({
            data: {
                id: 'claim-2',
                claimNumber: 'SZK/2024/00124',
                policyId: 'policy-3',
                clientId: 'client-3',
                incidentDate: daysAgo(20),
                reportedDate: daysAgo(18),
                description: 'Kradzież części ładunku z parkingu w Holandii.',
                location: 'Rotterdam, Holandia',
                claimedAmount: 120000,
                reservedAmount: 100000,
                status: 'UNDER_REVIEW',
            },
        }),
        prisma.claim.create({
            data: {
                id: 'claim-3',
                claimNumber: 'SZK/2024/00100',
                policyId: 'policy-4',
                clientId: 'client-4',
                incidentDate: daysAgo(90),
                reportedDate: daysAgo(88),
                description: 'Zepsucie ładunku mrożonek z powodu awarii agregatu.',
                location: 'Trasa Gdańsk - Monachium',
                claimedAmount: 45000,
                paidAmount: 42000,
                status: 'PAID',
            },
        }),
    ]);
    console.log(`✅ Created ${claims.length} claims`);

    // Seed Quotes
    const quotes = await Promise.all([
        prisma.quote.create({
            data: {
                clientNIP: '1112223334',
                sumInsured: 300000,
                territorialScope: 'EUROPE',
                selectedClauses: 'GROSS_NEGLIGENCE,PARKING',
                apkDataJson: JSON.stringify({
                    mainCargoTypes: ['Elektronika', 'AGD'],
                    averageCargoValue: 80000,
                    maxSingleShipmentValue: 200000,
                    monthlyShipments: 25,
                }),
                calculationResultJson: JSON.stringify({ totalPremium: 5200 }),
                status: 'CALCULATED',
                brokerId: 'dev-broker',
            },
        }),
        prisma.quote.create({
            data: {
                clientNIP: '5556667778',
                sumInsured: 150000,
                territorialScope: 'POLAND',
                selectedClauses: 'GROSS_NEGLIGENCE',
                calculationResultJson: JSON.stringify({ totalPremium: 1800 }),
                status: 'SENT',
                brokerId: 'dev-broker',
            },
        }),
    ]);
    console.log(`✅ Created ${quotes.length} quotes`);

    console.log('🎉 Database seeded successfully!');
}

main()
    .catch((e) => {
        console.error('Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
