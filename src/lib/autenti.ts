// Mock Autenti E-signature Service
import { SignatureStatus } from '@/types';

export interface AutentiProcess {
    id: string;
    documentId: string;
    status: SignatureStatus;
    signingUrl: string;
    createdAt: Date;
}

const mockProcesses: Map<string, AutentiProcess> = new Map();

/**
 * Simulates creating a signature process in Autenti
 */
export const createSignatureProcess = async (documentId: string, documentTitle: string): Promise<AutentiProcess> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const id = `auth-${Math.random().toString(36).substr(2, 9)}`;
    const process: AutentiProcess = {
        id,
        documentId,
        status: 'SENT',
        signingUrl: `https://autenti.com/sign/${id}`, // Mock URL
        createdAt: new Date(),
    };

    mockProcesses.set(id, process);
    console.log(`[Autenti Mock] Process created for ${documentTitle} (${id})`);

    return process;
};

/**
 * Simulates checking the status of a signature process
 */
export const getSignatureStatus = async (processId: string): Promise<SignatureStatus> => {
    const process = mockProcesses.get(processId);
    if (!process) throw new Error('Process not found');

    return process.status;
};

/**
 * Simulates the actual signing action (usually happens on Autenti servers)
 */
export const simulateSigning = async (processId: string): Promise<boolean> => {
    const process = mockProcesses.get(processId);
    if (!process) return false;

    // Simulate signing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    process.status = 'SIGNED';
    mockProcesses.set(processId, process);

    return true;
};
