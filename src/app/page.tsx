import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import CalendarView from "@/components/CalendarView";
import ChatBox from "@/components/ChatBox";

export default function Home() {
    return (
        <div className="min-h-screen bg-[#f8f6ff] flex items-center justify-center p-4">
            <div className="bg-white border border-[#e8e4f0] rounded-2xl overflow-hidden flex flex-col w-full max-w-[1200px] h-[640px] shadow-sm">
                {/* Top Bar */}
                <Header />

                {/* Main Content */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Left Sidebar */}
                    <Sidebar />

                    {/* Calendar Panel */}
                    <CalendarView />

                    {/* Chat Panel */}
                    <ChatBox />
                </div>
            </div>
        </div>
    );
}
