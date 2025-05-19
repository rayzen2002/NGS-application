import { ProposalForm } from "@/components/proposta/form";
import React from "react";


export default async function Proposta() {
  return (
      <div className="flex flex-col mb-5 w-[100%]">
        <ProposalForm />
      </div>
  );
}