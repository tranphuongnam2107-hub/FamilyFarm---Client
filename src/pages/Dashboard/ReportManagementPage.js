import SidebarDashboard from "../../components/Dashboard/SidebarDashboard";
import ListReport from "../../components/ReportManagement/ListReport";
import { useState } from "react";

const ReportManagementPage = () => {
    const [filter, setFilter] = useState("All");

    return (
        <div className="flex min-h-screen">
            {/* Sidebar bên trái */}
            <SidebarDashboard />
            <div className="p-8 w-full bg-[#3DB3FB]/5">
                <div className="text-left mb-5 font-semibold flex items-center gap-2 text-[#3E3F5E]/25">
                    <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6.52734 13V8.5H9.52734V13H13.2773V7H15.5273L8.02734 0.25L0.527344 7H2.77734V13H6.52734Z" fill="rgba(62, 63, 94, 0.25)" />
                    </svg>
                    <span>HOME / Report</span>
                </div>

                <div className="justify-between flex flex-row">
                    <div>
                        <h1 className="text-2xl font-bold text-blue-500 mb-6 text-left">
                            REPORT MANAGEMENT
                        </h1>
                        <div className="flex border-b border-gray-300 mb-6">
                            <button
                                onClick={() => setFilter("All")}
                                className={`mr-6 pb-2 px-5 font-semibold ${filter === "All" ? "border-b-2 border-blue-400 text-blue-500" : "text-gray-400"}`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilter("Accepted")}
                                className={`mr-6 pb-2 px-5 font-semibold ${filter === "Accepted" ? "border-b-2 border-blue-400 text-blue-500" : "text-gray-400"}`}
                            >
                                Accepted
                            </button>
                            <button
                                onClick={() => setFilter("Rejected")}
                                className={`mr-6 pb-2 px-5 font-semibold ${filter === "Rejected" ? "border-b-2 border-blue-400 text-blue-500" : "text-gray-400"}`}
                            >
                                Rejected
                            </button>
                            <button
                                onClick={() => setFilter("Pending")}
                                className={`mr-6 pb-2 px-5 font-semibold ${filter === "Pending" ? "border-b-2 border-blue-400 text-blue-500" : "text-gray-400"}`}
                            >
                                Pending
                            </button>
                        </div>
                    </div>
                </div>

                {/* Render ListReport component with filter prop */}
                <ListReport filter={filter} />
            </div>
        </div>
    );
};

export default ReportManagementPage;