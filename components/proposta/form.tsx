'use client';
import React, { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import { z } from 'zod';
import { useForm, useWatch } from 'react-hook-form';

/* eslint-disable */


import { Checkbox } from '../ui/checkbox';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import CurrencyInput from '../ui/currency-input';
import { Button } from '../ui/button';
import {
  BadgeDollarSign,
  Car,
  CreditCard,
  FileText,
  Languages,
  MapPin,
  RotateCcw,
  Send,
  Users,
  UserRound,
} from 'lucide-react';




const formSchema = z.object({
  customersNames: z.string().min(2, {
    message: 'Nome do cliente deve ter no mínimo 3 caracteres.',
  }),
  vehicles: z.string().min(3, {
    message: 'Digite um nome válido de veículo',
  }),
  address: z.string().min(3, {
    message: 'Digite um endereço válido',
  }),
  monthlyValueLiability: z.coerce.number(),
  optionADueToday: z.coerce.number(),
  optionBDueToday: z.coerce.number(),
  optionCDueToday: z.coerce.number(),
  optionAMonthly: z.coerce.number(),
  optionBMonthly: z.coerce.number(),
  optionCMonthly: z.coerce.number(),
  fee: z.coerce.number().optional(), // Fee is optional
  hasDebit: z.boolean(),
  debitValue: z.coerce.number().optional(),
  paymentOptions: z.enum(['3', '5', '6', '11']),
  customPaymentOptions: z.union([z.literal(''), z.coerce.number().int().min(2)]).optional(),
  isFinanced: z.boolean(),
  language: z.enum(['Português', 'Espanhol']),
  salesTeam: z.enum(['Time Jessica' , 'Time Nathalia'], {
    required_error: `Selecione um time de vendas`
  })
});

export function ProposalForm() {
  const [loadingRequest, setLoadingRequest] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>();

  useEffect(() => {
    async function fetchMe() {
      try {
        const res = await fetch('/api/me', {
          credentials: 'include',
        });

        if (!res.ok) return;

        const data = await res.json();
        setUserName(data.user.username);
      } catch (error) {
        console.error('Erro ao buscar usuário:', error);
      }
    }

    fetchMe();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customersNames: '',
      vehicles: '',
      address: '',
      monthlyValueLiability: 0,
      optionADueToday: 0,
      optionBDueToday: 0,
      optionCDueToday: 0,
      optionAMonthly: 0,
      optionBMonthly: 0,
      optionCMonthly: 0,
      fee: 275, // Default fee value set to 250
      hasDebit: false,
      debitValue: 0,
      paymentOptions: '6',
      customPaymentOptions: '',
      isFinanced: true, // Default to "Financiado"
      language: 'Português',
      salesTeam: 'Time Jessica'
      // seguradora: '', // Empty by default
      // vendedor: '', // Empty by default
    },
  });

  const isFinanciado = useWatch({

    control: form.control,
    name: 'isFinanced',
  });

  const hasDebit = useWatch({
    control: form.control,
    name: 'hasDebit',
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const fee = (values.fee ?? 250) + (values.hasDebit ? values.debitValue ?? 0 : 0);
    const paymentOptions = typeof values.customPaymentOptions === 'number'
      ? values.customPaymentOptions.toString()
      : values.paymentOptions;
    const paramsObj: Record<string, string> = {
      customersNames: values.customersNames,
      vehicles: values.vehicles,
      address: values.address,
      monthlyValueLiability: values.monthlyValueLiability.toString(),
      optionBDueToday: values.optionBDueToday.toString(),
      optionCDueToday: values.optionCDueToday.toString(),
      optionBMonthly: values.optionBMonthly.toString(),
      optionCMonthly: values.optionCMonthly.toString(),
      fee: fee.toString(),
      paymentOptions,
      isFinanced: values.isFinanced.toString(),
      language: values.language,
      salesTeam: values.salesTeam,
      backofficer : userName || 'null',
    };
    
    // Only include Liability options if isFinanced is false
    if (!values.isFinanced) {
      paramsObj.optionADueToday = values.optionADueToday.toString();
      paramsObj.optionAMonthly = values.optionAMonthly.toString();
    }

    const params = new URLSearchParams(paramsObj);

    const imageUrl = isFinanciado ? `/api/og-financed-miniatura?${params.toString()}` : `/api/og-own-miniatura?${params.toString()}`;
    console.log(paramsObj)
    window.open(imageUrl, '_blank');
  }


  // const isLoading = loadingSeguradoras || loadingVendedores;

  return (
    <div className="mx-auto w-full max-w-2xl px-3 py-6 sm:px-4">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="overflow-hidden rounded-md border bg-background shadow-sm"
        >
          <div className="border-b bg-gradient-to-r from-blue-50 via-background to-muted/30 px-4 py-4 dark:from-blue-950/25 dark:via-background dark:to-muted/20 sm:px-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-blue-600 text-white shadow-md shadow-blue-600/20 ring-1 ring-blue-500/20">
                  <FileText className="size-6" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold leading-tight text-foreground">Gerar proposta</h1>
                  <p className="text-sm font-medium text-muted-foreground">Backofficer: {userName || '-'}</p>
                </div>
              </div>

              <FormField
                control={form.control}
                name="isFinanced"
                render={({ field }: any) => (
                  <FormItem>
                    <FormControl>
                      <div className="grid grid-cols-2 rounded-md border bg-background p-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className={`h-8 border transition-all hover:shadow-sm ${
                            field.value
                              ? 'border-blue-600 bg-blue-600 text-white shadow-sm hover:bg-blue-700 hover:text-white'
                              : 'border-transparent text-muted-foreground hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/40'
                          }`}
                          onClick={() => field.onChange(true)}
                        >
                          Financiado
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className={`h-8 border transition-all hover:shadow-sm ${
                            !field.value
                              ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 hover:text-white'
                              : 'border-transparent text-muted-foreground hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40'
                          }`}
                          onClick={() => field.onChange(false)}
                        >
                          Quitado
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="space-y-5 p-4 sm:p-5">
            <section className="space-y-4 rounded-md border p-4">
              <div className="flex items-center gap-2">
                <UserRound className="size-4 text-muted-foreground" />
                <h2 className="text-base font-semibold">Informações da cotação</h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="customersNames"
                  render={({ field }: any) => (
                    <FormItem>
                      <FormLabel>Nome do cliente</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            placeholder="Nome do cliente"
                            className="pl-9"
                            {...field}
                            onChange={(e) => {
                              const uppercasedValue = e.target.value.toUpperCase();
                              field.onChange(uppercasedValue);
                            }}
                            value={field.value}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vehicles"
                  render={({ field }: any) => (
                    <FormItem>
                      <FormLabel>Veículos</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Car className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            placeholder="Veículos do cliente"
                            className="pl-9"
                            {...field}
                            onChange={(e) => {
                              const uppercasedValue = e.target.value.toUpperCase();
                              field.onChange(uppercasedValue);
                            }}
                            value={field.value}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }: any) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Endereço</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            placeholder="Endereço do cliente"
                            className="pl-9"
                            {...field}
                            onChange={(e) => {
                              const uppercasedValue = e.target.value.toUpperCase();
                              field.onChange(uppercasedValue);
                            }}
                            value={field.value}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </section>

            <section className="space-y-4 rounded-md border p-4">
              <div className="flex items-center gap-2">
                <CreditCard className="size-4 text-muted-foreground" />
                <h2 className="text-base font-semibold">Condições de pagamento</h2>
              </div>

              <div className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="fee"
                    render={({ field }: any) => (
                      <FormItem>
                        <FormLabel>Fee</FormLabel>
                        <FormControl>
                          <CurrencyInput
                            value={field.value || 250}
                            onChange={field.onChange}
                            placeholder="Valor do Fee"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="paymentOptions"
                    render={({ field }: any) => (
                      <FormItem>
                        <FormLabel>Pagamentos</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            onChange={(event) => {
                              field.onChange(event);
                              form.setValue('customPaymentOptions', '');
                            }}
                            className="border-input bg-background text-foreground shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border px-3 text-sm outline-none transition-[color,box-shadow] focus-visible:ring-[3px] dark:bg-input/30 dark:text-foreground"
                          >
                            <option value="3" className="bg-background text-foreground dark:bg-gray-950 dark:text-gray-50">3</option>
                            <option value="5" className="bg-background text-foreground dark:bg-gray-950 dark:text-gray-50">5</option>
                            <option value="6" className="bg-background text-foreground dark:bg-gray-950 dark:text-gray-50">6</option>
                            <option value="11" className="bg-background text-foreground dark:bg-gray-950 dark:text-gray-50">11</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customPaymentOptions"
                    render={({ field }: any) => (
                      <FormItem>
                        <FormLabel>Customizada</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={2}
                            step={1}
                            placeholder="Qtd."
                            {...field}
                            value={field.value}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hasDebit"
                    render={({ field }: any) => (
                      <FormItem>
                        <FormLabel>Débito</FormLabel>
                        <FormControl>
                          <label className="flex h-9 cursor-pointer items-center rounded-md border px-3 shadow-xs transition-colors hover:bg-muted/50">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(checked) => {
                                field.onChange(Boolean(checked));

                                if (!checked) {
                                  form.setValue('debitValue', 0);
                                }
                              }}
                            />
                            <span className="ml-2 text-sm font-medium">Adicionar</span>
                          </label>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {hasDebit && (
                  <FormField
                    control={form.control}
                    name="debitValue"
                    render={({ field }: any) => (
                      <FormItem>
                        <FormLabel>Valor do débito</FormLabel>
                        <FormControl>
                          <CurrencyInput
                            value={field.value || 0}
                            onChange={field.onChange}
                            placeholder="Valor do débito"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </section>

            <section className="space-y-4 rounded-md border p-4">
              <div className="flex items-center gap-2">
                <BadgeDollarSign className="size-4 text-muted-foreground" />
                <h2 className="text-base font-semibold">Valores</h2>
              </div>

              <div className="grid gap-4">
                {!isFinanciado && (
                  <div className="rounded-md border border-l-4 border-l-emerald-500 bg-muted/20 p-4">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <h3 className="font-semibold text-emerald-700 dark:text-emerald-400">Liability</h3>
                      <span className="rounded-md bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                        Quitado
                      </span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="optionADueToday"
                        render={({ field }: any) => (
                          <FormItem>
                            <FormLabel>Entrada</FormLabel>
                            <FormControl>
                              <CurrencyInput
                                value={field.value || 0}
                                onChange={field.onChange}
                                placeholder="Valor a pagar hoje"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="optionAMonthly"
                        render={({ field }: any) => (
                          <FormItem>
                            <FormLabel>Mensal</FormLabel>
                            <FormControl>
                              <CurrencyInput
                                value={field.value || 0}
                                onChange={field.onChange}
                                placeholder="Valor mensal"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                <div className="rounded-md border border-l-4 border-l-blue-500 bg-muted/20 p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h3 className="font-semibold text-blue-700 dark:text-blue-400">Full Coverage</h3>
                    <span className="rounded-md bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-400">
                      Opção B
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="optionBDueToday"
                      render={({ field }: any) => (
                        <FormItem>
                          <FormLabel>Entrada</FormLabel>
                          <FormControl>
                            <CurrencyInput
                              value={field.value || 0}
                              onChange={field.onChange}
                              placeholder="Valor a pagar hoje"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="optionBMonthly"
                      render={({ field }: any) => (
                        <FormItem>
                          <FormLabel>Mensal</FormLabel>
                          <FormControl>
                            <CurrencyInput
                              value={field.value || 0}
                              onChange={field.onChange}
                              placeholder="Valor mensal"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="rounded-md border border-l-4 border-l-red-500 bg-muted/20 p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h3 className="font-semibold text-red-700 dark:text-red-400">Full Coverage + Reboque</h3>
                    <span className="rounded-md bg-red-500/10 px-2 py-1 text-xs font-medium text-red-700 dark:text-red-400">
                      Opção C
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="optionCDueToday"
                      render={({ field }: any) => (
                        <FormItem>
                          <FormLabel>Entrada</FormLabel>
                          <FormControl>
                            <CurrencyInput
                              value={field.value || 0}
                              onChange={field.onChange}
                              placeholder="Valor a pagar hoje"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="optionCMonthly"
                      render={({ field }: any) => (
                        <FormItem>
                          <FormLabel>Mensal</FormLabel>
                          <FormControl>
                            <CurrencyInput
                              value={field.value || 0}
                              onChange={field.onChange}
                              placeholder="Valor mensal"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-4 rounded-md border p-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="salesTeam"
                render={({ field }: any) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Users className="size-4 text-muted-foreground" />
                      Time de vendas
                    </FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="border-input bg-background text-foreground shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border px-3 text-sm outline-none transition-[color,box-shadow] focus-visible:ring-[3px] dark:bg-input/30 dark:text-foreground"
                      >
                        <option value="Time Jessica" className="bg-background text-foreground dark:bg-gray-950 dark:text-gray-50">Time Jessica</option>
                        <option value="Time Nathalia" className="bg-background text-foreground dark:bg-gray-950 dark:text-gray-50">Time Nathalia</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="language"
                render={({ field }: any) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Languages className="size-4 text-muted-foreground" />
                      Idioma
                    </FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="border-input bg-background text-foreground shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border px-3 text-sm outline-none transition-[color,box-shadow] focus-visible:ring-[3px] dark:bg-input/30 dark:text-foreground"
                      >
                        <option value="Português" className="bg-background text-foreground dark:bg-gray-950 dark:text-gray-50">Português</option>
                        <option value="Espanhol" className="bg-background text-foreground dark:bg-gray-950 dark:text-gray-50">Espanhol</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t bg-muted/30 px-4 py-4 sm:flex-row sm:justify-end sm:px-5">
            <Button
              type="button"
              variant="outline"
              className="w-full border-red-200 text-red-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-50 hover:text-red-800 hover:shadow-md dark:border-red-900/60 dark:text-red-400 dark:hover:bg-red-950/30 sm:w-auto"
              onClick={() => form.reset()}
            >
              <RotateCcw className="size-4" />
              Resetar
            </Button>

            <Button
              type="submit"
              className="w-full bg-blue-600 text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md sm:w-auto"
            >
              <Send className="size-4" />
              {loadingRequest ? 'Aguarde...' : 'Gerar proposta'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
