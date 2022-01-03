export type Operation = 'cash-in' | 'cash-out'

export type MmoOperation = 'deposit' | 'withdraw'
export interface AgentCashInOutBody {
  amount: number;
  token: string;
}
