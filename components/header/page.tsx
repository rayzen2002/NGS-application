'use client';


import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

import {
  CircleDollarSign,
  ComputerIcon,
  Handshake,
  Car,
  FileStack,
} from 'lucide-react';
import Link from 'next/link';
import { ModeToggle } from '../theme/mode-toggle';

import { LogoutButton } from '../logout-button';


interface Props {
  activeTab: 'relatorios' | 'proposta' | 'financeiras' | 'comprovantes';
}



export function Header({ activeTab }: Props) {
  return (
    <div className="flex flex-col items-center w-[100%]">
      <div className="mt-6 flex justify-between items-center w-[100%]">
        <div>
        
          <div className="flex space-x-1 mt-1">
            
          </div>{' '}
        </div>

      <LogoutButton />
      </div>

      <div className="flex items-center mt-6 mb-6 text-3xl w-[100%]">
        <div className="flex  justify-between space-x-3 items-center w-[100%]">
          <div className="w-10"></div>

          <div className="flex items-center">
            <Avatar className="w-24 h-24">
              <AvatarImage src="/ngs.png" className="" />
              <AvatarFallback>NGS</AvatarFallback>
            </Avatar>

            <h1 className="ml-3 text-3xl font-medium tracking-tight">
              NGS Backoffice
            </h1>
          </div>
    <ModeToggle />
        </div>
      </div>

      <div className="border-b w-[100%] flex justify-center">
        <div className="flex items-center gap-6 px-6">
          <Car className="h-8 w-8" />

          <Separator orientation="vertical" />

          <nav className="flex items-center lg:space-x-6">
            <Link
              href="/backofficer"
              className="flex items-center lg:space-x-6 text-xl gap-2 py-2"
              style={
                activeTab === 'proposta'
                  ? { borderBottom: '4px solid #1D4ED8' }
                  : {}
              }
            >
              <Handshake className="h-6 w-6" />
              Proposta
            </Link>

            <Link
              href="/backofficer/relatorios"
              className="flex items-center lg:space-x-6 text-xl gap-2 py-2"
              style={
                activeTab === 'relatorios'
                  ? { borderBottom: '4px solid #1D4ED8' }
                  : {}
              }
            >
              <ComputerIcon className="h-6 w-6" />
              Relatorios
            </Link>

            <Link
              href="/backofficer/financeiras"
              className="flex items-center lg:space-x-6 text-xl gap-2 py-2"
              style={
                activeTab === 'financeiras'
                  ? { borderBottom: '4px solid #1D4ED8' }
                  : {}
              }
            >
              <CircleDollarSign />
              Financeiras
            </Link>
            <Link
              href="/backofficer/comprovantes"
              className="flex items-center lg:space-x-6 text-xl gap-2 py-2"
              style={
                activeTab === 'comprovantes'
                  ? { borderBottom: '4px solid #1D4ED8' }
                  : {}
              }
            >
              <FileStack />
              Comprovantes
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-2"></div>

          <div className="ml-auto flex items-center gap-2 color-white">
            
          </div>
        </div>
      </div>
    </div>
  );
}