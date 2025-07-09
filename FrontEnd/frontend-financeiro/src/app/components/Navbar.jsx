'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Adicionado 'relative' para que o menu dropdown se posicione corretamente
    return (
        <nav className="bg-blue-100 shadow-md relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/" className="text-2xl font-bold text-gray-800">
                            FIDC IJJ
                        </Link>
                    </div>

                    {/* Links do Menu - Desktop */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="/operacao-bordero" className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                            Criar Borderô
                        </Link>
                        <Link href="/consultas" className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                            Consultas
                        </Link>
                        <Link href="/fluxo-caixa" className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                            Fluxo de Caixa
                        </Link>
                        <Link href="/cadastros/clientes" className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                            Cadastros
                        </Link>
                    </div>

                    {/* Botão do Menu Hambúrguer - Mobile */}
                    <div className="md:hidden flex items-center">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-800 hover:bg-gray-100 focus:outline-none">
                            <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                {isMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Menu Dropdown - Mobile (com novo estilo) */}
            {isMenuOpen && (
                // Alterações aqui: fundo branco, sombra e posicionamento absoluto
                <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg z-20">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <Link href="/operacao-bordero" className="block text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-base font-medium">Criar Borderô</Link>
                        <Link href="/consultas" className="block text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-base font-medium">Consultas</Link>
                        <Link href="/fluxo-caixa" className="block text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-base font-medium">Fluxo de Caixa</Link>
                        <Link href="/cadastros/clientes" className="block text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-base font-medium">Cadastros</Link>
                    </div>
                </div>
            )}
        </nav>
    );
}