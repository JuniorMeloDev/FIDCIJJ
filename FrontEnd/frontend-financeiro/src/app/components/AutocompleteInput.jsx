'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

// O portal que renderiza a lista de sugestões
const DropdownPortal = ({ sugestoes, onSugestaoClick, inputRef }) => {
    const [style, setStyle] = useState({});

    useEffect(() => {
        if (inputRef.current) {
            const rect = inputRef.current.getBoundingClientRect();
            setStyle({
                position: 'absolute',
                top: `${rect.bottom + window.scrollY + 2}px`,
                left: `${rect.left + window.scrollX}px`,
                width: `${rect.width}px`,
            });
        }
    }, [sugestoes]); // Recalcula a posição sempre que a lista de sugestões muda

    if (sugestoes.length === 0) return null;

    return createPortal(
        <ul style={style} className="z-50 bg-white border border-gray-300 rounded-md max-h-40 overflow-y-auto shadow-lg">
            {sugestoes.map(banco => (
                <li
                    key={banco.ispb}
                    onMouseDown={(e) => { // Usamos onMouseDown para evitar que o input perca o foco antes do clique
                        e.preventDefault();
                        onSugestaoClick(banco);
                    }}
                    className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100"
                >
                    {banco.name}
                </li>
            ))}
        </ul>,
        document.body
    );
};


export default function AutocompleteInput({ value, onChange }) {
    const [sugestoes, setSugestoes] = useState([]);
    const [bancos, setBancos] = useState([]);
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef(null);

    // Busca a lista de bancos da API
    useEffect(() => {
        fetch('https://brasilapi.com.br/api/banks/v1')
            .then(res => res.json())
            .then(data => setBancos(data))
            .catch(error => console.error("Falha ao buscar a lista de bancos:", error));
    }, []);

    const handleInputChange = (e) => {
        const query = e.target.value;
        onChange(query); // Informa o pai sobre a mudança
        
        if (query.length > 0 && bancos.length > 0) {
            const filteredSugestoes = bancos.filter(banco =>
                banco && banco.name && banco.name.toLowerCase().includes(query.toLowerCase())
            );
            setSugestoes(filteredSugestoes);
        } else {
            setSugestoes([]);
        }
    };

    const handleSugestaoClick = (sugestao) => {
        onChange(sugestao.name); // Informa o pai sobre o valor selecionado
        setSugestoes([]); // Limpa as sugestões
    };

    return (
        <div className="relative w-full">
            <input
                ref={inputRef}
                type="text"
                name="banco"
                placeholder="Banco"
                value={value || ''} // O valor é sempre controlado pelo componente pai
                onChange={handleInputChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)} // Controlamos o foco para fechar o dropdown
                autoComplete="off"
                className="border-gray-300 rounded-md shadow-sm p-1.5 text-sm w-full"
            />
            {isFocused && sugestoes.length > 0 && (
                <DropdownPortal 
                    sugestoes={sugestoes}
                    onSugestaoClick={handleSugestaoClick}
                    inputRef={inputRef}
                />
            )}
        </div>
    );
}