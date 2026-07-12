// components/distribution-patterns/TopDocumentTypesTable.tsx

"use client";

interface TopDocumentTypeDto {
    documentTypeId: number;
    name: string;
    count: number;
    percentage: number;
}

interface TopDocumentTypesTableProps {
    data: TopDocumentTypeDto[];
}

export function TopDocumentTypesTable({ data }: TopDocumentTypesTableProps) {
    if (!data || data.length === 0) {
        return (
            <div className="flex h-32 items-center justify-center text-gray-400">
                لا توجد بيانات
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-gray-200 text-right">
                        <th className="pb-2 font-medium text-gray-500">#</th>
                        <th className="pb-2 font-medium text-gray-500">نوع الوثيقة</th>
                        <th className="pb-2 font-medium text-gray-500">عدد المراسلات</th>
                        <th className="pb-2 font-medium text-gray-500">النسبة</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr key={item.documentTypeId} className="border-b border-gray-100 hover:bg-gray-50 transition">
                            <td className="py-2 text-center text-gray-400">{index + 1}</td>
                            <td className="py-2 font-medium text-gray-800">{item.name}</td>
                            <td className="py-2 font-semibold text-amber-600">{item.count}</td>
                            <td className="py-2 text-gray-600">{item.percentage.toFixed(1)}%</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}