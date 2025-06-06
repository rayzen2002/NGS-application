export enum ActivityTypeEnum {
  COTACAO = "cotacao",
  FECHAMENTO = "fechamento",
  SERVICO = "servico",
}

export type Relatorio = {
  id: number;
  backofficer_id: number;
  seller_id: number;
  started_at: Date;
  finished_at: Date;
  activity_type: ActivityTypeEnum;
  customer: string;
  trello_card_url: string;
  additional_info: string;
};

export type RelatoriosResponse = Relatorio[];
