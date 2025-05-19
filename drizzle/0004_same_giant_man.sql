CREATE TABLE "fechamento_pagamentos" (
	"report_id" integer PRIMARY KEY NOT NULL,
	"pago" boolean DEFAULT false NOT NULL,
	"marcado_por" integer,
	"marcado_em" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "fechamento_pagamentos" ADD CONSTRAINT "fechamento_pagamentos_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fechamento_pagamentos" ADD CONSTRAINT "fechamento_pagamentos_marcado_por_users_id_fk" FOREIGN KEY ("marcado_por") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;