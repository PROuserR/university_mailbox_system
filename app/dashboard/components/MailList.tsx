export default function MailList() {
    return (
        <div className="p-4">
            <h2 className="font-semibold mb-4">البريد الوارد</h2>

            <div className="space-y-3">
                <div className="p-3 bg-gray-100 rounded-lg cursor-pointer">
                    <p className="font-medium text-sm">جامعة الإدارة</p>
                    <p className="text-xs text-gray-500">تم تحديث الجدول الدراسي</p>
                </div>

                <div className="p-3 hover:bg-gray-100 rounded-lg cursor-pointer">
                    <p className="font-medium text-sm">د. أحمد</p>
                    <p className="text-xs text-gray-500">يرجى مراجعة المشروع</p>
                </div>
            </div>
        </div>
    );
}