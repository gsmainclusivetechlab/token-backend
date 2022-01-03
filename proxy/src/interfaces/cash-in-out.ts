export type Operation = 'cash-in' | 'cash-out'

export type Action = 'accept' | 'reject'

export interface AgentCashInOutBody {
  amount: number;
  token: string;
}
