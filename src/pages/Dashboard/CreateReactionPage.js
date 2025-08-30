import SidebarDashboard from "../../components/Dashboard/SidebarDashboard";
import CreateReactionFrom from "../../components/ReactionManagement/CreateReactionForm";

const CreateReactionPage = () => {

    return (
        <div className="flex min-h-screen">
            {/* Sidebar bên trái */}
            <SidebarDashboard />
            <div className="p-8 w-full bg-[#3DB3FB]/5">
                <div className="text-left mb-5 font-semibold flex items-center gap-2 text-[#3E3F5E]/25">
                    <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6.52734 13V8.5H9.52734V13H13.2773V7H15.5273L8.02734 0.25L0.527344 7H2.77734V13H6.52734Z" fill="rgba(62, 63, 94, 0.25)" />
                    </svg>
                    <span>HOME / Reaction</span>
                </div>

                <div className="justify-between flex flex-row">
                    <div>
                        <h1 className="text-2xl font-bold text-blue-500 mb-6 text-left">
                            REACTION MANAGEMENT
                        </h1>
                    </div>
                </div>

                {/* Render ListPost component with filter prop */}
                <CreateReactionFrom />
            </div>
        </div>
    );
};

export default CreateReactionPage;