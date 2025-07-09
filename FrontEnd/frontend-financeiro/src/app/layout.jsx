import { Inter } from "next/font/google";
import Navbar from "./components/Navbar"; 
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
          
          {/* O cabeçalho agora é apenas este componente */}
          <Navbar />
          
          {/* Área de conteúdo que cresce e tem sua própria rolagem */}
          <div className="flex-grow overflow-y-auto">
            {children}
          </div>

        </div>
      </body>
    </html>
  );
}