import MailList from "./components/MailList";
import MailViewer from "./components/MailViewer";
import RightPanel from "./components/RightPanel";

export default function DashboardPage() {
    return (
        <div className="flex h-fit w-screen overflow-hidden gap-4 p-4">
            {/* Mail List */}
            <div className="w-[30%] bg-white rounded-xl border">
                <MailList />
            </div>

            {/* Mail Viewer */}
            <div className="flex-1 bg-white rounded-xl border">
                <MailViewer />
            </div>

            {/* Right Panel */}
            <div className="w-[25%] bg-white rounded-xl border">
                <RightPanel />
            </div>
        </div>
    );
}