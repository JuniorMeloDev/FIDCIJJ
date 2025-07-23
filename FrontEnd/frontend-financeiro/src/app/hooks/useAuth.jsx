'use client';

import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export default function useAuth() {
    const [auth, setAuth] = useState({ user: null, isAdmin: false });

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                const user = {
                    username: decodedToken.sub,
                    roles: decodedToken.roles || [],
                };
                // Verifica se a lista de roles inclui 'ROLE_ADMIN'
                const isAdmin = user.roles.includes('ROLE_ADMIN');
                setAuth({ user, isAdmin });
            } catch (error) {
                console.error("Failed to decode token:", error);
                setAuth({ user: null, isAdmin: false });
            }
        }
    }, []);

    return auth;
}