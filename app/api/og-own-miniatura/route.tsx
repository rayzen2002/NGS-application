import { ImageResponse } from 'next/og';

export const runtime = 'edge';


const IMG_BASE_URL = process.env.NEXT_PUBLIC_IMG_BASE_URL
const MAX_NAME_LENGTH = 220;
const MAX_VEHICLE_LENGTH = 220;
const MAX_ADDRESS_LENGTH = 220;

// Função auxiliar para calcular valores de total
const calculateTotal = (dueToday: string, fee: string, monthly: string, payments: string) => {
  const totalValue = parseFloat(dueToday) + parseFloat(fee) + parseFloat(monthly) * (parseInt(payments) - 1);
  return totalValue > 99999 ? Math.ceil(totalValue) : totalValue.toFixed(2);
};
// Função auxiliar para truncar valores
const truncateValue = (value : number) => {
  return (value) > 99999 ? Math.ceil((value)) : (value).toFixed(2);
};

// Função para renderizar as opções de imagem baseadas em financiado e idioma
const getImageSrc = (isFinanciado: boolean, language: string, salesTeam: string) => {
  const imgType = isFinanciado ? '2ops' : '3ops';
  const langSuffix = language === 'Português' ? 'pt' : 'es';
  const teamSuffix = salesTeam === 'Time Jessica' ? 'a' : 'b'
  return `${IMG_BASE_URL}proposta-miniatura-${langSuffix}-${imgType}-${teamSuffix}.png`;
};

export async function GET(request: Request) {

  try {
    const { searchParams } = new URL(request.url);
    // Obter dados do formulário
 
    const customerName = searchParams.get('customersNames')?.slice(0, MAX_NAME_LENGTH) || 'Cliente';
    const vehicles = searchParams.get('vehicles')?.slice(0, MAX_VEHICLE_LENGTH) || 'Modelo do Carro';
    const address = searchParams.get('address')?.slice(0, MAX_ADDRESS_LENGTH) || 'Endereço não informado';
    const optionADueToday = searchParams.get('optionADueToday') || '0';
    const optionBDueToday = searchParams.get('optionBDueToday') || '0';
    const optionCDueToday = searchParams.get('optionCDueToday') || '0';
    const optionAMonthly = searchParams.get('optionAMonthly') || '0';
    const optionBMonthly = searchParams.get('optionBMonthly') || '0';
    const optionCMonthly = searchParams.get('optionCMonthly') || '0';
    const fee = searchParams.get('fee') || '250';
    const numberOfPayments = searchParams.get('paymentOptions') || '6';
    const language = searchParams.get('language') || 'Português';
    const isFinanciado = searchParams.get('isFinanciado') === 'true';

    const backofficerName = searchParams.get('backofficer') || 'null'
    const sellerTeamName = searchParams.get('salesTeam') || 'null'

    const backofficerNameInitial = backofficerName.slice(0, 2)

    const salesTeamNameInitial = sellerTeamName.charAt(5) 
    const now = new Date()
    now.setHours(now.getHours() - 3)

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

          <img
  src={imageSrc}
  width={1920}
  height={1080}
/>


          {/* Dados principais */}
          <div tw="flex absolute top-[113] right-[248] w-[40] justify-center items-center">
          <p tw="text-[33px] font-black text-4xl font-bold">
          {parseInt(numberOfPayments) - 1}x
          </p>
        </div>
          <div tw="flex absolute top-70 left-27 w-135 h-28  text-start items-center  overflow-hidden  ">
          <p tw={`${customerName.length > 120 ? 'text-xl ' : customerName.length > 70 ? 'text-2xl' : 'text-3xl'}  truncate`}>
              {customerName}
            </p>
          </div>
          {/* <div tw="absolute top-[113] left-[26] flex overflow-hidden w-[150]">
            <p tw="text-2xl  text-black text-right">
              {vehicles}
            </p>
          </div> */}
          <div tw="flex absolute top-108 left-27 w-135 h-27 text-start items-center  overflow-hidden ">
          <p tw={`${vehicles.length > 120 ? 'text-xl ' : vehicles.length > 70 ? 'text-2xl' : 'text-3xl'}  truncate`}>
              {vehicles}
            </p>
          </div>



          {/* <div tw="flex absolute top-108 left-27 w-[135px] h-[23px] text-start items-center bg-red-500">
            <p tw={`${vehicles.length > 100 ? 'text-xl' : vehicles.length > 70 ? 'text-2xl' : 'text-3xl'}`}>
              {vehicles}
            </p>
          </div> */}

<div tw="absolute top-[145] left-[26] flex overflow-hidden items-center w-135 h-27">
<p tw="text-3xl ">
              {address}
            </p>
          </div>


              {/* Opção A */}
              <div tw="flex absolute top-[140] right-[192] w-[40] justify-center items-center">
  <p tw="text-[33px] text-5xl font-bold" style={{ fontWeight: 900 }}>
    ${truncateValue(parseFloat(optionADueToday) + parseInt(fee))}
  </p>
</div>
<div tw="flex absolute top-[140] right-[122] w-[40] justify-center items-center">
  <p tw="text-[33px] text-5xl font-bold">
    ${truncateValue(parseFloat(optionAMonthly))}
  </p>
</div>
<div tw="flex absolute top-[140] right-[51] w-[40] justify-center items-center">
  <p tw="text-[33px] text-5xl font-bold">
    ${calculateTotal(optionADueToday, fee, optionAMonthly, numberOfPayments)}
  </p>
</div>

{/* Opção B */}
<div tw="flex absolute top-[178] right-[192] w-[40] justify-center items-center">
  <p tw="text-[33px] text-5xl font-bold">
    ${truncateValue(parseFloat(optionBDueToday) + parseInt(fee))}
  </p>
</div>
<div tw="flex absolute top-[178] right-[122] w-[40] justify-center items-center">
  <p tw="text-[33px] text-5xl font-bold">
    ${truncateValue(parseFloat(optionBMonthly))}
  </p>
</div>
<div tw="flex absolute top-[178] right-[51] w-[40] justify-center items-center">
  <p tw="text-[33px] text-5xl font-bold">
    ${calculateTotal(optionBDueToday, fee, optionBMonthly, numberOfPayments)}
  </p>
</div>

{/* Opção C */}
<div tw="flex absolute top-[216] right-[192] w-[40] justify-center items-center">
  <p tw="text-[33px] text-5xl font-bold">
    ${truncateValue(parseFloat(optionCDueToday) + parseInt(fee))}
  </p>
</div>
<div tw="flex absolute top-[216] right-[122] w-[40] justify-center items-center">
  <p tw="text-[33px] text-5xl font-bold">
    ${truncateValue(parseFloat(optionCMonthly))}
  </p>
</div>
<div tw="flex absolute top-[216] right-[51] w-[40] justify-center items-center">
  <p tw="text-[33px] text-5xl font-bold">
    ${calculateTotal(optionCDueToday, fee, optionCMonthly, numberOfPayments)}
  </p>
</div>
<div tw="flex absolute bottom-[0] right-[20] justify-center items-center">
  <p tw="text-xl text-white" style={{
    textShadow: '0 2px 4px rgba(0,0,0,0.7)',
  }}>
    
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