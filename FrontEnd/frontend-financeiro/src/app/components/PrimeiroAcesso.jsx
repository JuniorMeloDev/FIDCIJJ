'use client';

import { useRouter } from 'next/navigation';

export default function PrimeiroAcesso() {
    const router = useRouter();

    const handleCadastroClick = () => {
        // Redireciona para a página de cadastros
        router.push('/cadastros/clientes'); 
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="p-10 bg-white rounded-lg shadow-xl text-center max-w-lg mx-4">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">Bem-vindo(a) ao FIDC IJJ!</h1>
                <p className="text-gray-600 mb-6">
                 Para começar a usar o sistema, o primeiro passo é cadastrar a sua empresa, pelo menos uma conta bancária associada a ela e o tipo de operação.
                </p>
                <p className="text-gray-600 mb-8">
                    Clique no botão abaixo para ser direcionado à tela de cadastros.
                </p>
                <button
                    onClick={handleCadastroClick}
                    className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-300"
                >
                    Iniciar Cadastro
                </button>
            </div>
        </div>
    );
}