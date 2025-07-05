import { Inter } from "next/font/google";
import Link from 'next/link';
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Sistema Financeiro",
  description: "Gestão de Desconto de Duplicatas",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <body className={`${inter.className} h-screen overflow-hidden`}>
        <div className="bg-gray-100 h-full flex flex-col">
          {/* Navegação que não encolhe */}
          <nav className="bg-blue-100 shadow-md flex-shrink-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex-shrink-0 flex items-center">
                  <Link href="/" className="text-2xl font-bold text-black-600">
                    FIDC IJJ
                  </Link>
                </div>
                <div className="flex items-center space-x-8">
                  <Link href="/operacao-bordero" className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                    Criar Borderô
                  </Link>
                  <Link href="/consultas" className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                    Consultas
                  </Link>
                  <Link href="/fluxo-caixa" className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                    Fluxo de Caixa
                  </Link>
                  <Link href="/lancamentos" className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                    Lançamentos
                  </Link>
                  <Link href="/cadastros/clientes" className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                  Cadastros
                </Link>
                </div>
              </div>
            </div>
          </nav>
          
          {/* Área de conteúdo que cresce e tem sua própria rolagem */}
          <div className="flex-grow overflow-y-auto">
            {children}
          </div>

        </div>
      </body>
    </html>
  );
}
