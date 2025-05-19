import { pgEnum, pgTable, integer, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
// Definindo ENUMs
export const userRoleEnum = pgEnum("user_role", ["admin", "backofficer", "supervisor", "seller"]);
export const activityTypeEnum = pgEnum("activity_type", ["cotacao", "fechamento", "servico"]);

// Tabela de Usuários
export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  role: userRoleEnum(),
  username: varchar({length: 255}).unique().notNull(),
  password: varchar({length: 255}).notNull()
});

// Tabela de Relatórios (Atividades diárias dos Backofficers)
export const reportsTable = pgTable("reports", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  backofficer_id: integer().notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  seller_id: integer().notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  started_at: timestamp().notNull(),
  finished_at: timestamp(),
  activity_type: activityTypeEnum(),
  customer: varchar({ length: 255 }).notNull(),
  trello_card_url: varchar({ length: 500 })
});

export const fechamentoPagamentosTable = pgTable("fechamento_pagamentos", {
  report_id: integer().primaryKey().references(() => reportsTable.id, { onDelete: "cascade" }),
  pago: boolean().notNull().default(false), 
  marcado_por: integer().references(() => usersTable.id, { onDelete: "set null" }),
  marcado_em: timestamp().defaultNow(),
  dealer_id: integer().references(() => dealersTable.id, { onDelete: "set null" }), // ← novo campo
});


export const dealersTable = pgTable("dealers", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }),
  routing: varchar({ length:255 }),
  account: varchar({ length: 255 }),
  zelle: varchar({ length: 255 }), 
});

