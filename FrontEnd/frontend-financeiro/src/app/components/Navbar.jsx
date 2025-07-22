'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const router = useRouter();
    const pathname = usePathname();
    const profileRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setCurrentUser({ username: decoded.sub }); // O 'sub' (subject) do token agora é o username
            } catch (e) {
                console.error("Token inválido:", e);
                handleLogout();
            }
        } else {
            setCurrentUser(null);
        }
    }, [pathname]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        setCurrentUser(null);
        router.push('/login');
    };

    if (!currentUser) {
        return null;
    }

    return (
        <nav className="bg-blue-100 shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/" className="text-2xl font-bold text-gray-800">FIDC IJJ</Link>
                    </div>

                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="/operacao-bordero" className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">Criar Borderô</Link>
                        <Link href="/consultas" className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">Consultas</Link>
                        <Link href="/fluxo-caixa" className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">Fluxo de Caixa</Link>
                        <Link href="/cadastros/clientes" className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">Cadastros</Link>
                    </div>

                    <div className="flex items-center">
                        <div className="relative" ref={profileRef}>
                            <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-2 p-2 rounded-md hover:bg-blue-200">
                                <span className="font-semibold text-gray-700">{currentUser.username}</span>
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </button>
                            {isProfileOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 py-1">
                                    <Link href="/profile" onClick={() => setIsProfileOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Perfil</Link>
                                    <button onClick={handleLogout} className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Sair</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}