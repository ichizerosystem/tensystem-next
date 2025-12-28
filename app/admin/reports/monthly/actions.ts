'use server';

import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth/rbac';
import { getJstMonthRange } from '@/lib/date';

export type MonthlyAddonBreakdown = {
    addonDefinitionId: string;
    name: string;
    totalQuantity: number;
    totalCost: number;
};

export type MonthlyClientRow = {
    clientId: string;
    name: string;
    paymentCap: number | null; // From RecipientCertificate
    contractQuantity: number | null; // From ServiceContract
    commuteDays: number; // Count of 'Present'
    absentDays: number; // Count of 'Absent'
    addonTotalCost: number;
    addonBreakdown: MonthlyAddonBreakdown[];
};

export async function listMonthlyReport(monthStr: string): Promise<MonthlyClientRow[]> {
    const session = await requireUser();
    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { officeId: true },
    });

    if (!user?.officeId) return [];

    const { start, end } = getJstMonthRange(monthStr);

    // 1. Fetch Clients
    const clients = await prisma.client.findMany({
        where: { officeId: user.officeId },
        include: {
            serviceDays: {
                where: {
                    serviceDate: {
                        gte: start,
                        lt: end,
                    }
                },
                include: {
                    addons: true
                }
            },
            recipientCertificates: {
                where: {
                    validFrom: { lte: end }, // Active somewhat in the period
                    validTo: { gte: start }
                },
                orderBy: { validFrom: 'desc' },
                take: 1
            },
            serviceContracts: {
                where: {
                    validFrom: { lte: end },
                    validTo: { gte: start }
                },
                orderBy: { validFrom: 'desc' },
                take: 1
            }
        },
        orderBy: { name: 'asc' }
    });

    // 2. Aggregate
    return clients.map(client => {
        const cert = client.recipientCertificates[0];
        const contract = client.serviceContracts[0];

        let commuteDays = 0;
        let absentDays = 0;

        // Addon aggregation
        const addonMap = new Map<string, MonthlyAddonBreakdown>();
        let addonTotalCost = 0;

        client.serviceDays.forEach(day => {
            // Status counting
            if (day.status === 'Present') commuteDays++;
            if (day.status === 'Absent') absentDays++;

            // Addons
            day.addons.forEach(addon => {
                const existing = addonMap.get(addon.addonDefinitionId) || {
                    addonDefinitionId: addon.addonDefinitionId,
                    name: addon.name,
                    totalQuantity: 0,
                    totalCost: 0
                };

                existing.totalQuantity += addon.quantity;
                const cost = addon.quantity * addon.unitPrice;
                existing.totalCost += cost;
                addonTotalCost += cost;

                addonMap.set(addon.addonDefinitionId, existing);
            });
        });

        return {
            clientId: client.id,
            name: client.name,
            paymentCap: cert?.paymentCap ?? null,
            contractQuantity: contract?.quantity ?? null,
            commuteDays,
            absentDays,
            addonTotalCost,
            addonBreakdown: Array.from(addonMap.values())
        };
    });
}

function escapeCsv(field: any): string {
    if (field === null || field === undefined) return '';
    const str = String(field);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

export async function exportMonthlyReportCsv(monthStr: string): Promise<{ ok: true; filename: string; csv: string } | { ok: false; message: string }> {
    try {
        const data = await listMonthlyReport(monthStr);

        const headers = [
            "clientName",
            "commuteDays",
            "absentDays",
            "addonTotalCost",
            "paymentCap",
            "contractQuantity",
            "addonBreakdown"
        ];

        const rows = data.map(row => {
            const breakdown = row.addonBreakdown
                .map(a => `${a.name}:${a.totalQuantity}=${a.totalCost}`)
                .join('; ');

            return [
                row.name,
                row.commuteDays,
                row.absentDays,
                row.addonTotalCost,
                row.paymentCap,
                row.contractQuantity,
                breakdown
            ].map(escapeCsv).join(',');
        });

        const csvContent = [headers.join(','), ...rows].join('\n');
        const filename = `monthly-report_${monthStr}.csv`;

        return { ok: true, filename, csv: csvContent };
    } catch (e) {
        console.error(e);
        return { ok: false, message: "Server error" };
    }
}
