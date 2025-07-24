'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import PrimeiroAcesso from './PrimeiroAcesso';

export default function SetupChecker({ children }) {
    const [status, setStatus] = useState({ loading: true, needsSetup: false, isAuthenticated: false });
    const [error, setError] = useState(null);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const checkStatus = async () => {
            const publicPaths = ['/', '/login', '/register'];
            if (publicPaths.includes(pathname)) {
                 setStatus({ loading: false, needsSetup: false, isAuthenticated: false });
                 return;
            }
            
            setStatus(prev => ({...prev, loading: true}));
            try {
                const token = sessionStorage.getItem('authToken');
                const isAuthenticated = !!token;

                const response = await fetch('http://localhost:8080/api/setup/status');
                if (!response.ok) {
                    throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está em execução.');
                }
                const data = await response.json();
                
                setStatus({ loading: false, needsSetup: data.needsSetup, isAuthenticated });

                // LÓGICA DE REDIRECIONAMENTO REMOVIDA
                // O sistema não vai mais forçar o redirecionamento para /cadastros
                if (!isAuthenticated) {
                    router.push('/login');
                }

            } catch (err) {
                console.error(err);
                setError(err.message);
                setStatus(prev => ({...prev, loading: false}));
            }
        };

        checkStatus();
    }, [pathname, router]);

    const token = typeof window !== 'undefined' ? sessionStorage.getItem('authToken') : null;
    const isAuthenticated = !!token;

    if (isAuthenticated && pathname === '/login') {
        router.push('/resumo');
        return null;
    }
    
    if (status.loading) {
        return <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">A carregar...</div>;
    }
    
    if (error) {
        return <div className="flex items-center justify-center min-h-screen text-red-400 bg-gray-900">{error}</div>;
    }
    
    const publicPaths = ['/', '/login', '/register'];
    if (publicPaths.includes(pathname)) {
        return <>{children}</>;
    }

    // Se precisar de setup e estiver em uma página protegida, mostra a tela de primeiro acesso.
    if (status.needsSetup) {
        if (pathname.startsWith('/cadastros')) {
            return <>{children}</>;
        }
        return <PrimeiroAcesso />;
    }
    
    if(isAuthenticated){
        return <>{children}</>;
    }

    return null;
}