'use client';
import { useLogout } from "@/lib/logout";
import { LogOut } from "lucide-react";

export function LogoutButton(){
  const logout = useLogout();
        return(  <button
          onClick={logout}
          className="flex items-center gap-2 text-red-500 hover:text-red-700"
        >
          <LogOut className="h-6 w-6" />
        </button>)
}