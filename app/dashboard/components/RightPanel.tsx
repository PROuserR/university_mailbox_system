export default function RightPanel() {
    return (
        <div className="p-4 space-y-4">

            {/* Calendar */}
            <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">التقويم</p>
                <p className="text-xs text-gray-500">
                    لا توجد أحداث اليوم
                </p>
            </div>

            {/* Stats */}
            <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">الإحصائيات</p>
                <p className="text-xs text-gray-500">
                    128 رسالة واردة
                </p>
            </div>

        </div>
    );
}