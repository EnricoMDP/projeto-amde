// Lista completa de UFs brasileiras (26 estados + DF)
export const UFS_BRASILEIRAS = [
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapá" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" },
  { value: "PR", label: "Paraná" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piauí" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" },
] as const;

// Apenas os códigos (útil para validação)
export const UFS_CODIGOS = UFS_BRASILEIRAS.map(uf => uf.value);

/**
 * Calcula a data mínima permitida para data de nascimento (150 anos atrás)
 */
export function getDataNascimentoMinima(): string {
  const data = new Date();
  data.setFullYear(data.getFullYear() - 150);
  return data.toISOString().split('T')[0];
}

/**
 * Calcula a data máxima permitida para data de nascimento (6 meses atrás)
 */
export function getDataNascimentoMaxima(): string {
  const data = new Date();
  data.setMonth(data.getMonth() - 6);
  return data.toISOString().split('T')[0];
}
