import 'server-only';
import { verifySession } from './session';
import { Role } from '@prisma/client';
import { redirect } from 'next/navigation';

export async function requireUser() {
    const session = await verifySession();
    if (!session.isAuth || !session.userId) {
        redirect('/login');
    }
    return session;
}

export async function requireRole(role: Role) {
    const session = await requireUser();
    if (session.role !== role) {
        // In a real app, this should be a 403 Forbidden page
        throw new Error('Unauthorized');
    }
    return session;
}

export async function requireTenantOffice(officeId: string) {
    const session = await requireUser();
    // TODO: Implement proper cross-tenant/office check
    // For now, simple stub or check against session if we stored officeId in token
    return session;
}
