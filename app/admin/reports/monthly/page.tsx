import Link from "next/link";
import { listMonthlyReport } from "./actions";
import DownloadButton from "./download-button";
import AlertModal from "./alert-modal";
import { getJstCurrentMonthStr } from "@/lib/date";

export default async function MonthlyReportPage({
    searchParams,
}: {
    searchParams: Promise<{ month?: string; alerts?: string; commute?: string }>;
}) {
    const params = await searchParams;
    const initialMonth = params.month || getJstCurrentMonthStr();
    const alertsOnly = params.alerts === '1';
    const commuteOnly = params.commute === '1';

    const rawReportData = await listMonthlyReport(initialMonth);

    const reportData = rawReportData.filter(row => {
        let keep = true;
        if (alertsOnly) {
            const capOver = row.paymentCap != null && row.addonTotalCost > row.paymentCap;
            const qtyOver = row.contractQuantity != null && row.commuteDays > row.contractQuantity;
            if (!capOver && !qtyOver) keep = false;
        }
        if (keep && commuteOnly) {
            if (row.commuteDays <= 0) keep = false;
        }
        return keep;
    });

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">月次集計レポート</h1>

            <div className="flex gap-4 items-end bg-white p-4 rounded shadow">
                <form className="flex gap-4 items-end">
                    <div>
                        <label className="block text-sm font-bold mb-1">対象月</label>
                        <input
                            type="month"
                            name="month"
                            defaultValue={initialMonth}
                            className="border p-2 rounded"
                        />
                    </div>
                    <div className="flex items-center gap-4 pb-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                name="alerts"
                                value="1"
                                defaultChecked={alertsOnly}
                                className="w-4 h-4"
                            />
                            <span className="text-sm font-bold">⚠️のみ</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                name="commute"
                                value="1"
                                defaultChecked={commuteOnly}
                                className="w-4 h-4"
                            />
                            <span className="text-sm font-bold">通所のみ</span>
                        </label>
                    </div>
                    <div>
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                            表示
                        </button>
                    </div>
                </form>
                <div>
                    <DownloadButton month={initialMonth} />
                </div>
            </div>

            <div className="bg-white rounded shadow overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-100 border-b">
                            <th className="p-3">利用者名</th>
                            <th className="p-3 text-center">通所日数</th>
                            <th className="p-3 text-center">欠席日数</th>
                            <th className="p-3 text-right">契約支給量</th>
                            <th className="p-3 text-right">上限管理月額</th>
                            <th className="p-3 text-right">加算合計額</th>
                            <th className="p-3">加算内訳</th>
                            <th className="p-3">アラート</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.map((row) => (
                            <tr key={row.clientId} className="border-b hover:bg-gray-50">
                                <td className="p-3 font-medium">
                                    <Link href={`/admin/clients/${row.clientId}`} className="text-blue-600 hover:underline">
                                        {row.name}
                                    </Link>
                                </td>
                                <td className="p-3 text-center">{row.commuteDays}</td>
                                <td className="p-3 text-center">{row.absentDays}</td>
                                <td className="p-3 text-right text-gray-600">
                                    {row.contractQuantity ?? '-'}
                                </td>
                                <td className="p-3 text-right text-gray-600">
                                    {row.paymentCap ? `¥${row.paymentCap.toLocaleString()}` : '-'}
                                </td>
                                <td className="p-3 text-right">
                                    ¥{row.addonTotalCost.toLocaleString()}
                                </td>
                                <td className="p-3 text-sm text-gray-600">
                                    {row.addonBreakdown.length > 0 ? (
                                        <ul className="list-disc list-inside">
                                            {row.addonBreakdown.map((addon) => (
                                                <li key={addon.addonDefinitionId}>
                                                    {addon.name}: {addon.totalQuantity}回 (¥{addon.totalCost.toLocaleString()})
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        '-'
                                    )}
                                </td>
                                <td className="p-3">
                                    <AlertModal
                                        monthStr={initialMonth}
                                        row={row}
                                        capOver={row.paymentCap != null && row.addonTotalCost > row.paymentCap}
                                        qtyOver={row.contractQuantity != null && row.commuteDays > row.contractQuantity}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {reportData.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        対象月のデータが見つかりません。
                    </div>
                )}
            </div>
        </div>
    );
}
