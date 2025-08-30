// pages/statistics/StatisticDashboard.jsx
import React from "react";
import BookingListPage from "../../components/Statistic/BookingListPage";
import ExpertRevenue from "../../components/Statistic/ExpertRevenue";
import ProcessNav from "../../components/ProcessNav/ProcessNav";
import BookingDetailPage from "../../components/Statistic/BookingDetailPage";
import BookingStatisticPage from "../../components/Statistic/BookingStatisticPage";
import Header from "../../components/Header/Header";

const PageStatisticExpert = () => {
  return (
    <div className="text-gray-800 bg-white">
      <Header />
      <div className="pt-16 mx-auto progress-management max-w-7xl">
        {/* <ProcessNav inPage="Overview" /> */}
        <BookingListPage />
        <ExpertRevenue />
        <BookingDetailPage />

        <BookingStatisticPage />
      </div>
    </div>
  );
};

export default PageStatisticExpert;
