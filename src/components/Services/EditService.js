import React from "react";
import ProcessNav from "../ProcessNav/ProcessNav";
import EditServiceForm from "./EditServiceForm";
import RecentServiceList from "./RecentServiceList";
import PopularService from "./PopularService";

export default function EditService() {
  return (
    <div className="progress-management pt-16 h-auto">
      <div className="max-w-7xl mx-auto">
        <ProcessNav />
        {/* <div className="mt-10 w-full space-x-6 grid grid-cols-[2fr_5fr]"> */}
        <div className="mt-10 w-full grid grid-cols-[2fr_5fr] gap-6 items-start">
            {/* <RecentServiceList /> */}
            <PopularService/>
            <EditServiceForm />
        </div>
      </div>
    </div>
  );
}