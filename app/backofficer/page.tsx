import { Header } from "@/components/header/page";
import Proposta from "./proposta/page";

export default async function Backofficer(){
  return (
    <div>
      <Header activeTab="proposta" />
      <Proposta />
    </div>
  )
}