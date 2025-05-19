-- Criar os tipos ENUM
CREATE TYPE "public"."activity_type" AS ENUM('cotacao', 'fechamento', 'servico');
CREATE TYPE "public"."user_role" AS ENUM('admin', 'backofficer', 'supervisor', 'seller');

-- Criar a tabela "reports"
CREATE TABLE "reports" (
  "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "reports_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
  "backofficer_id" integer NOT NULL,
  "backofficer_user_name" varchar(255) NOT NULL,
  "started_at" timestamp NOT NULL,
  "finished_at" timestamp,
  "activity_type" "public"."activity_type" -- Referenciar o ENUM corretamente
);

-- Criar a tabela "users"
CREATE TABLE "users" (
  "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
  "name" varchar(255) NOT NULL,
  "role" "public"."user_role" -- Referenciar o ENUM corretamente
);

-- ALTERAR as colunas para o tipo ENUM
ALTER TABLE "reports" 
  ALTER COLUMN "activity_type" 
  TYPE "public"."activity_type" 
  USING "activity_type"::"public"."activity_type"; -- Especificar como realizar a conversão

ALTER TABLE "users"
  ALTER COLUMN "role" 
  TYPE "public"."user_role" 
  USING "role"::"public"."user_role"; -- Especificar como realizar a conversão

-- Criar a chave estrangeira entre "reports" e "users"
ALTER TABLE "reports"
  ADD CONSTRAINT "reports_backofficer_id_users_id_fk"
  FOREIGN KEY ("backofficer_id") REFERENCES "public"."users"("id")
  ON DELETE CASCADE
  ON UPDATE NO ACTION;
