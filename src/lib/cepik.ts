import { CEPiKData } from '@/types';

const MOCK_VEHICLES: Record<string, CEPiKData> = {
    'WA12345': {
        registrationNumber: 'WA12345',
        vin: 'WVB1234567890ABCD',
        brand: 'SCANIA',
        model: 'R450',
        productionYear: 2021,
        engineCapacity: 12742,
        fuelType: 'DIESEL',
        maxWeight: 18000,
        ownWeight: 8200,
        technicalInspectionValidTo: new Date('2025-10-15'),
        insuranceOCValidTo: new Date('2025-05-20'),
        ownerData: {
            name: 'TRANS-LOGISTYKA S.A.',
            address: 'ul. Transportowa 10, 00-100 Warszawa'
        }
    },
    'KR99887': {
        registrationNumber: 'KR99887',
        vin: 'VLV0987654321ZYXW',
        brand: 'VOLVO',
        model: 'FH13',
        productionYear: 2022,
        engineCapacity: 12800,
        fuelType: 'DIESEL',
        maxWeight: 19000,
        ownWeight: 8400,
        technicalInspectionValidTo: new Date('2025-12-01'),
        insuranceOCValidTo: new Date('2025-08-11'),
        ownerData: {
            name: 'KRAK-TRANS SP. Z O.O.',
            address: 'ul. Krakowska 55, 30-001 Kraków'
        }
    },
    'PO5566A': {
        registrationNumber: 'PO5566A',
        vin: 'MAN11223344556677',
        brand: 'MAN',
        model: 'TGX',
        productionYear: 2020,
        engineCapacity: 12400,
        fuelType: 'DIESEL',
        maxWeight: 18000,
        ownWeight: 8100,
        technicalInspectionValidTo: new Date('2024-11-20'),
        insuranceOCValidTo: new Date('2025-02-15'),
        ownerData: {
            name: 'POZ-FREIGHT',
            address: 'ul. Poznańska 1, 60-001 Poznań'
        }
    }
};

export const searchVehicle = async (registrationNumber: string): Promise<CEPiKData | null> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const normalizedReg = registrationNumber.toUpperCase().replace(/\s/g, '');
    return MOCK_VEHICLES[normalizedReg] || null;
};
