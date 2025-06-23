// Função para formatar o valor como moeda brasileira
export const formatBRL = (value) => {
    if (!value) return '';
    const cleanValue = String(value).replace(/\D/g, ''); // Remove tudo que não é dígito
    if (cleanValue === '') return '';
    const numberValue = Number(cleanValue) / 100;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numberValue);
};

// Função para converter o valor formatado de volta para número
export const parseBRL = (value) => {
    if (!value) return 0;
    const numberString = String(value).replace(/\D/g, '');
    return parseFloat(numberString) / 100;
};