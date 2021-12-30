export type Operation = 'cash-in' | 'cash-out'

export interface AgentCashInOutBody {
  amount: number;
  token: string;
}
