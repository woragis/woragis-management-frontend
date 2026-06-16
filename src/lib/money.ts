export function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function reaisToCents(value: number): number {
  return Math.round(value * 100)
}

export function centsToReais(cents: number): number {
  return cents / 100
}
