import { Inter } from "next/font/google";
import Navbar from "./components/Navbar"; 
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "FIDC IJJ",
  description: "Gestão de Desconto de Duplicatas",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <body className={`${inter.className} h-screen overflow-hidden`}>
        <div className="bg-gray-100 h-full flex flex-col">
          <Navbar />
          <div className="flex-grow overflow-y-auto">
            {children}
          </div>

        </div>
      </body>
    </html>
  );
}