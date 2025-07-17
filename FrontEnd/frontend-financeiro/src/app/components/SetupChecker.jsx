'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import PrimeiroAcesso from './PrimeiroAcesso';

export default function SetupChecker({ children }) {
    const [needsSetup, setNeedsSetup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const pathname = usePathname();

    useEffect(() => {
        const checkSetup = async () => {
            setLoading(true);
            try {
                const response = await fetch('http://localhost:8080/api/setup/status');
                if (!response.ok) {
                    throw new Error('Não foi possível verificar o status da aplicação. Verifique se o back-end está no ar.');
                }
                const data = await response.json();
                setNeedsSetup(data.needsSetup);
            } catch (error) {
                console.error(error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        checkSetup();
    }, [pathname]);

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Verificando configuração...</div>;
    }
    
    if (error) {
        return <div className="flex items-center justify-center min-h-screen text-red-500">{error}</div>;
    }

    if (needsSetup) {
        // Se a configuração for necessária, mas o usuário estiver em qualquer página de cadastro,
        // permita o acesso.
        if (pathname.startsWith('/cadastros')) {
            return <>{children}</>;
        }
        
        // Para todas as outras páginas, force a tela de boas-vindas.
        return <PrimeiroAcesso />;
    }

    // Se a configuração já foi feita, renderiza a aplicação normalmente.
    return <>{children}</>;
}