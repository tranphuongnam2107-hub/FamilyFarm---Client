import React from "react";
import ProcessNav from "../ProcessNav/ProcessNav";
import CreateServiceForm from "./CreateServiceForm";
import RecentServiceList from "./RecentServiceList";
import PopularService from "./PopularService";

export default function CreateService() {
  return (
    <div className="progress-management pt-16 h-full">
      <div className="max-w-7xl mx-auto">
        <ProcessNav />
        <div className="mt-10 w-full grid grid-cols-[2fr_5fr] gap-6 items-start">
            {/* <RecentServiceList /> */}
            <PopularService/>
            <CreateServiceForm />
        </div>
      </div>
    </div>
  );
}