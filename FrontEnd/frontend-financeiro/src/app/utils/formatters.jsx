export const formatBRLInput = (value) => {
    if (!value) return '';
    const cleanValue = String(value).replace(/\D/g, ''); // Remove tudo que não é dígito
    if (cleanValue === '') return '';
    const numberValue = Number(cleanValue) / 100;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numberValue);
};

/**
 * Converte uma string de moeda BRL formatada de volta para um número.
 * Ex: "R$ 123,45" -> 123.45
 */
export const parseBRL = (value) => {
    if (!value) return 0;
    const numberString = String(value).replace(/\D/g, '');
    if (numberString === '') return 0;
    return parseFloat(numberString) / 100;
};

/**
 * Formata um número puro para uma string de moeda BRL.
 * Ex: 123.45 -> "R$ 123,45"
 */
export const formatBRLNumber = (value) => {
    const number = typeof value === 'number' ? value : 0;
    return number.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};