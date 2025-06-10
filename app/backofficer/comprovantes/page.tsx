'use client';

import { FieldError, useForm, UseFormRegister } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Header } from '@/components/header/page';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  state: z.string().min(1, 'Estado é obrigatório'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  zip_code: z.string().min(1, 'CEP é obrigatório'),
  full_name: z.string().min(1, 'Nome completo é obrigatório'),
  address: z.string().min(1, 'Endereço é obrigatório'),
  new_policy_start_date: z
  .string()
  .min(1, 'Data de início é obrigatória')
  .refine(
    (value) => /^\d{2}\/\d{2}\/\d{2}$/.test(value),
    { message: 'Data deve estar no formato MM/DD/YY' }
  ),
  vehicle_year: z.string().min(1, 'Ano do veículo é obrigatório'),
  vehicle_make: z.string().min(1, 'Marca é obrigatória'),
  vehicle_model: z.string().min(1, 'Modelo é obrigatório'),
  vehicle_vin: z.string().min(1, 'VIN é obrigatório'),
  lienholder: z.boolean(),
  lien_name: z.string().optional(),
  lien_address: z.string().optional(),
  lien_city_state_zip: z.string().optional(),
  garaging_proof: z.boolean(),
});

interface InputFieldProps {
  name: keyof FormData;
  label: string;
  register: UseFormRegister<FormData>;
  errors: Partial<Record<keyof FormData, FieldError | undefined>>;
  className?: string;
}


type FormData = z.infer<typeof formSchema>;

export default function Comprovantes() {
  const validStates = [
  'AR', 'CT', 'FL', 'GA', 'MA', 'MD', 'ME',
  'NC', 'NH',  'NJ', 'NY', 'OH', 'PA', 'RI', 'SC'
] as const;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      lienholder: false,
      garaging_proof: false,
    },
  });

  const lienholderSelected = watch('lienholder');

  const onSubmit = async (data: FormData) => {
    console.log(data)
    const response = await fetch('https://api-pdfbinder.onrender.com/generate-pdf/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'documentos.zip';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col min-h-screen ">
      <Header activeTab="comprovantes" />

      <div className="max-w-3xl mx-auto p-6  shadow-md rounded-md mt-6 border">
        <h1 className="text-3xl font-semibold mb-6 text-center">Gerar Comprovantes</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* Seção: Dados Pessoais */}
          <section>
            <h2 className="text-xl font-medium mb-4 text-blue-700">Informações do Cliente</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
            <label className="block text-sm font-medium">Estado</label>
           <Select
                onValueChange={(value) => {
                  setValue('state', value);
                  trigger('state');
                }}
>

              <SelectTrigger className="mt-1 w-full">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent className='bg-blue-500'>
                {validStates.map((uf) => (
                  <SelectItem key={uf} value={uf}>
                    {uf}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
                        {errors.state && (
              <p className="text-sm text-red-500 mt-1">{errors.state.message}</p>
            )}
          </div>
              <InputField name="city" label="Cidade" register={register} errors={errors} />
              <InputField name="zip_code" label="CEP" register={register} errors={errors} />
              <InputField name="full_name" label="Nome Completo" register={register} errors={errors} className="md:col-span-2" />
              <InputField name="address" label="Endereço (ex: 123 Main St Apt 4)" register={register} errors={errors} className="md:col-span-3" />
              <InputField name="new_policy_start_date" label="Data de Início (MM/DD/YY)" register={register} errors={errors} />
            </div>
          </section>

          {/* Seção: Veículo */}
          <section>
            <h2 className="text-xl font-medium mb-4 text-blue-700">Informações do Veículo</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputField name="vehicle_year" label="Ano" register={register} errors={errors} />
              <InputField name="vehicle_make" label="Marca" register={register} errors={errors} />
              <InputField name="vehicle_model" label="Modelo" register={register} errors={errors} />
              <InputField name="vehicle_vin" label="VIN" register={register} errors={errors} className="md:col-span-3" />
            </div>
          </section>

          {/* Seção: Financiamento */}
          <section>
            <label className="flex items-center space-x-2">
              <input type="checkbox" {...register('lienholder')} />
              <span>Possui financiamento?</span>
            </label>

            {lienholderSelected && (
              <div className="border border-gray-200 p-4 mt-4 rounded-md  space-y-4">
                <h3 className="text-md font-medium ">Dados da financeira</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField name="lien_name" label="Nome da Financeira" register={register} errors={errors} />
                  <InputField name="lien_address" label="Endereço da Financeira" register={register} errors={errors} />
                  <InputField name="lien_city_state_zip" label="Cidade/Estado/CEP (ex: CARMEL, IN 46082)" register={register} errors={errors} className="md:col-span-2" />
                </div>
              </div>
            )}
          </section>

          {/* Seção: Outras opções */}
          <section>
            <label className="flex items-center space-x-2">
              <input type="checkbox" {...register('garaging_proof')} />
              <span>Gerar Comprovante de endereço?</span>
            </label>
          </section>

          <div className="pt-4">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700  font-medium px-6 py-2 rounded-md w-full md:w-auto"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Gerando...' : 'Gerar PDFs'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Componente reutilizável para inputs
function InputField({ name, label, register, errors, className = '' }: InputFieldProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium">{label}</label>
      <input
        {...register(name, {
          onChange: (e) => {
            e.target.value = e.target.value.toUpperCase();
          },
        })}
        className="uppercase mt-1 block w-full border rounded-md px-3 py-2 shadow-sm"
      />
      {errors[name] && (
        <p className="text-sm text-red-500 mt-1">{errors[name]?.message}</p>
      )}
    </div>
  );
}

