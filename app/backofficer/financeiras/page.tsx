import React from "react";

import { DataTable } from "./data-table";
import { columns } from "./columns";
import { lienholderList } from "./financeiras";
import { Header } from "@/components/header/page";

export default async function Financeiras() {
  return (
      <div className="flex flex-col mx-auto justify-center ">
        <Header activeTab="financeiras" />
        <div className="">
          <DataTable data={lienholderList} columns={columns} />
        </div>
      </div>
  );
}