// components/DashboardPage.js
import Layout from "@/app/layout";
import React from "react";
import "../styles/dashboard.css"
import TracerButton from "@/components/TracerButton";
import { HiPlus } from 'react-icons/hi';
import DashboardItem from "@/components/DashboardItem";

const DashboardPage = () => {
  return (
    <Layout>
      <div className="flex flex-row items-center">
      <div className="me-8 text-xl">
        <h1>File Upload</h1>
      </div>
      <div>
      <TracerButton name = "Add New PO" icon = {<HiPlus/>} />
    </div>
      </div>
      <div className="w-100 bg-gray-500 my-8">
        Filter
      </div>
      <div>
        <DashboardItem poNumber={"123-456-789"} progress={2} assignedTo={"Collin Shields"} dueDate={"05/13/2024"} />
      </div>
    </Layout>
  );
};

export default DashboardPage;
