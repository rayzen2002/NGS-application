import { ImageResponse } from 'next/og';

export const runtime = 'edge';


const IMG_BASE_URL = process.env.NEXT_PUBLIC_IMG_BASE_URL 
// const IMG_BASE_URL = process.env.IMG_BASE_URL
const MAX_NAME_LENGTH = 300;
const MAX_VEHICLE_LENGTH = 220;
const MAX_ADDRESS_LENGTH = 220;

// Função auxiliar para calcular valores de total
const calculateTotal = (dueToday: string, fee: string, monthly: string, payments: string) => {
  const totalValue = parseFloat(dueToday) + parseFloat(fee) + parseFloat(monthly) * (parseInt(payments) - 1);
  return totalValue > 99999 ? Math.ceil(totalValue) : totalValue.toFixed(2);
};

// Função para renderizar as opções de imagem baseadas em financiado e idioma
const getImageSrc = (isFinanciado: boolean, language: string, salesTeam: string) => {
  // const imgType = isFinanciado ? '2ops' : '3ops';
  const langSuffix = language === 'Português' ? 'pt' : 'es';
  const teamSuffix = salesTeam === 'Time Jessica' ? 'a' : 'b'
  return `${IMG_BASE_URL}proposta-miniatura-${langSuffix}-2ops-${teamSuffix}.png`;
};

export async function GET(request: Request) {

  try {
    const { searchParams } = new URL(request.url);
    // Obter dados do formulário
 
    const customerName = searchParams.get('customersNames')?.slice(0, MAX_NAME_LENGTH) || 'Cliente';
    const vehicles = searchParams.get('vehicles')?.slice(0, MAX_VEHICLE_LENGTH) || 'Modelo do Carro';
    const address = searchParams.get('address')?.slice(0, MAX_ADDRESS_LENGTH) || 'Endereço não informado';
    // const optionADueToday = searchParams.get('optionADueToday') || '0';
    const optionBDueToday = searchParams.get('optionBDueToday') || '0';
    const optionCDueToday = searchParams.get('optionCDueToday') || '0';
    // const optionAMonthly = searchParams.get('optionAMonthly') || '0';
    const optionBMonthly = searchParams.get('optionBMonthly') || '0';
    const optionCMonthly = searchParams.get('optionCMonthly') || '0';
    const fee = searchParams.get('fee') || '250';
    const numberOfPayments = searchParams.get('paymentOptions') || '6';
    const language = searchParams.get('language') || 'Português';
    const isFinanciado = searchParams.get('isFinanciado') === 'true';

    const backofficerName = searchParams.get('backofficer') || 'null'
    const sellerTeamName = searchParams.get('salesTeam') || 'null'

    const backofficerNameInitial = backofficerName.charAt(0) 
    const salesTeamNameInitial = sellerTeamName.charAt(5) 
    const now = new Date()

    const day = String(now.getDate()).padStart(2, '0')
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const year = String(now.getFullYear()).slice(-2)
    const hour = String(now.getHours()).padStart(2, '0')
  
    const code = backofficerNameInitial + salesTeamNameInitial + day + month + year + hour
    // Gerar a imagem correta com base no financiamento e idioma
    const imageSrc = getImageSrc(isFinanciado, language, sellerTeamName);
    // const font = await fontData

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
      <div
  tw="flex"
>
</div>

          <img src={imageSrc} alt="proposta" />

            {/* Dados principais */}
            <div tw="flex absolute top-71 left-27 w-135 h-27  text-start items-center  overflow-hidden  ">
            <p tw={`${customerName.length > 120 ? 'text-xl ' : customerName.length > 70 ? 'text-2xl' : 'text-3xl'}  truncate`}>
              {customerName}
            </p>
          </div>


    
          <div tw="flex absolute top-108 left-27 w-135 h-27 text-start items-center  overflow-hidden ">
          <p tw={`${vehicles.length > 120 ? 'text-xl ' : vehicles.length > 70 ? 'text-2xl' : 'text-3xl'}  truncate`}>
              {vehicles}
            </p>
          </div>

          <div tw="absolute top-[145] left-[26] flex overflow-hidden items-center w-135 h-27 ">
            <p tw="text-3xl ">
              {address}
            </p>
          </div>

<div tw="flex absolute top-[132] right-[248] w-[40] justify-center items-center">
  <p tw="text-[33px] text-black text-4xl font-bold">
    {parseInt(numberOfPayments) - 1}x
  </p>
</div>

{/* Opção B */}
<div tw="flex absolute top-[160] right-[190] w-[40] justify-center items-center">
  <p tw="text-[33px]  text-5xl font-bold" style={{  }}>
    ${(parseFloat(optionBDueToday) + parseInt(fee)).toFixed(2)}
  </p>
</div>
<div tw="flex absolute top-[160] right-[120] w-[40] justify-center items-center">
  <p tw="text-[33px]  text-5xl font-bold " style={{  }}>
    ${(parseFloat(optionBMonthly)).toFixed(2)}
  </p>
</div>
<div tw="flex absolute top-[160] right-[49] w-[40] justify-center items-center">
  <p tw="text-[33px]  text-5xl font-bold" style={{  }}>
    ${calculateTotal(optionBDueToday, fee, optionBMonthly, numberOfPayments)}
  </p>
</div>

{/* Opção C */}
<div tw="flex absolute top-[205] right-[190] w-[40] justify-center items-center">
  <p tw="text-[33px] text-5xl font-bold" style={{  }}>
    ${(parseFloat(optionCDueToday) + parseInt(fee)).toFixed(2)}
  </p>
</div>
<div tw="flex absolute top-[205] right-[120] w-[40] justify-center items-center">
  <p tw="text-[33px] text-5xl font-bold" style={{  }}>
    ${(parseFloat(optionCMonthly)).toFixed(2)}
  </p>
</div>
<div tw="flex absolute top-[205] right-[49] w-[40] justify-center items-center">
  <p tw="text-[33px] text-5xl font-bold" style={{  }}>
    ${calculateTotal(optionCDueToday, fee, optionCMonthly, numberOfPayments)}
  </p>
</div>
<div tw="flex absolute bottom-[0] right-[0] w-[35] justify-center items-center">
  <p tw="text-[33px] text-xl font-bold" style={{  }}>
    {code}
  </p>
</div>

        </div>
      ),
      {
        width: 1920,
        height: 1080,  
   
      }
    );
  } catch (error) {
    console.error('Erro ao gerar a imagem:', error);
    return new Response('Erro ao gerar imagem', { status: 500 });
  }
}