"use client"
import MailList from "./components/MailList";
import MailViewer from "./components/MailViewer";
import RightPanel from "./components/RightPanel";


export default function DashboardPage() {
    return (
        <main className="flex flex-col h-fit w-screen overflow-hidden gap-12 p-4">
            <div className="flex flex-row-reverse text-right">
                {/* Mail List */}
                <div className="w-[30%] bg-white rounded-xl border">
                    <MailList />
                </div>

                {/* Mail Viewer */}
                <div className="flex-1 bg-white rounded-xl border">
                    <MailViewer />
                </div>

            </div>
        </main>
    );
}