'use client';

import { useState } from 'react';
import { exportMonthlyReportCsv } from './actions';

export default function DownloadButton({ month }: { month: string }) {
    const [loading, setLoading] = useState(false);

    const handleDownload = async () => {
        setLoading(true);
        try {
            const result = await exportMonthlyReportCsv(month);
            if (!result.ok) {
                alert(result.message || 'ダウンロードに失敗しました');
                return;
            }

            // Create Blob and download
            // Add BOM for Excel UTF-8 compatibility if strictly needed, but user said UTF-8 is fine for now. 
            // Standard UTF-8 usually doesn't need BOM, but Excel on Windows sometimes prefers it. 
            // I'll stick to standard UTF-8 as requested ("まずは UTF-8（BOM無し）でOK").
            const blob = new Blob([result.csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = result.filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (e) {
            console.error(e);
            alert('エラーが発生しました');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleDownload}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
            {loading ? '生成中...' : 'CSVダウンロード'}
        </button>
    );
}
