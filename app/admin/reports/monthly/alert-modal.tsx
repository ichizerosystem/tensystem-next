'use client';

import { useState } from 'react';
import Link from 'next/link';

// Define minimal types needed for the modal
type AddonBreakdown = {
    addonDefinitionId: string;
    name: string;
    totalQuantity: number;
    totalCost: number;
};

type RowData = {
    clientId: string;
    name: string;
    paymentCap: number | null;
    contractQuantity: number | null;
    commuteDays: number;
    addonTotalCost: number;
    addonBreakdown: AddonBreakdown[];
};

export default function AlertModal({
    monthStr,
    row,
    capOver,
    qtyOver
}: {
    monthStr: string;
    row: RowData;
    capOver: boolean;
    qtyOver: boolean;
}) {
    const [openType, setOpenType] = useState<'cap' | 'qty' | null>(null);

    const close = () => setOpenType(null);

    return (
        <div className="flex items-center gap-1">
            {/* Badges */}
            {capOver && (
                <button
                    type="button"
                    onClick={() => setOpenType('cap')}
                    className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded font-bold hover:bg-red-200"
                >
                    ⚠️ CAP_OVER
                </button>
            )}
            {qtyOver && (
                <button
                    type="button"
                    onClick={() => setOpenType('qty')}
                    className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded font-bold hover:bg-yellow-200"
                >
                    ⚠️ QTY_OVER
                </button>
            )}
            {!capOver && !qtyOver && <span className="text-gray-400">-</span>}

            {/* Modal */}
            {openType && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={close}>
                    <div
                        role="dialog"
                        aria-modal="true"
                        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4 relative"
                        onClick={e => e.stopPropagation()}
                    >
                        <h2 className="text-xl font-bold mb-4">
                            {openType === 'cap' ? '上限管理超過' : '契約支給量超過'}
                        </h2>

                        <div className="space-y-4 text-sm">
                            <div className="bg-gray-50 p-3 rounded">
                                <div className="font-bold text-gray-700">{monthStr}</div>
                                <div className="text-lg">{row.name} 様</div>
                            </div>

                            {openType === 'cap' && row.paymentCap !== null && (
                                <div className="space-y-2">
                                    <div className="flex justify-between border-b pb-1">
                                        <span>上限管理月額</span>
                                        <span>¥{row.paymentCap.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-1">
                                        <span>加算合計額</span>
                                        <span>¥{row.addonTotalCost.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-red-600">
                                        <span>超過額</span>
                                        <span>¥{(row.addonTotalCost - row.paymentCap).toLocaleString()}</span>
                                    </div>

                                    <div className="mt-4">
                                        <div className="font-bold text-gray-600 mb-1">加算内訳</div>
                                        <ul className="list-disc list-inside space-y-1 text-xs">
                                            {row.addonBreakdown.map((a, i) => (
                                                <li key={i}>
                                                    {a.name}: {a.totalQuantity}回 (¥{a.totalCost.toLocaleString()})
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {openType === 'qty' && row.contractQuantity !== null && (
                                <div className="space-y-2">
                                    <div className="flex justify-between border-b pb-1">
                                        <span>契約支給量</span>
                                        <span>{row.contractQuantity} 日</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-1">
                                        <span>通所日数</span>
                                        <span>{row.commuteDays} 日</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-red-600">
                                        <span>超過日数</span>
                                        <span>{row.commuteDays - row.contractQuantity} 日</span>
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 flex flex-col gap-2">
                                <Link
                                    href={`/admin/reports/monthly/${monthStr}/${row.clientId}`}
                                    className="block w-full text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-bold"
                                >
                                    利用者別月次詳細へ
                                </Link>
                                <button
                                    type="button"
                                    onClick={close}
                                    className="block w-full text-center bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300"
                                >
                                    閉じる
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
