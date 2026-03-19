// src/lib/brasilapi.ts

type DadosCNPJ = {
  razao_social: string;
  municipio: string;
  uf: string;
  ddd_telefone_1: string;
  email: string | null;
  situacao_cadastral: string | number;
  cnaes_secundarios: { codigo: string }[];
  cnae_fiscal: number;
};

export async function buscarCNPJ(cnpj: string): Promise<DadosCNPJ> {
  const cnpjLimpo = cnpj.replace(/\D/g, "");

  if (cnpjLimpo.length !== 14) {
    throw new Error("CNPJ deve ter 14 dígitos");
  }

  const response = await fetch(
    `https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`,
  );

  if (!response.ok) {
    throw new Error("CNPJ não encontrado ou inválido");
  }

  return response.json();
}

export function formatarTelefone(ddd: string): string {
  if (!ddd) return "";
  const limpo = ddd.replace(/\D/g, "");
  return limpo;
}

export function validarCNAE(
  cnaesFiscal: number,
  cnaesSecundarios: { codigo: string }[],
): boolean {
  const cnaesAceitos = [
    "4511101",
    "4511102",
    "4512901",
    "4512902",
    "4541201",
    "4541202",
    "4530701",
  ];

  const cnaesPrincipal = cnaesFiscal.toString();
  if (cnaesAceitos.some((c) => cnaesPrincipal.startsWith(c.slice(0, 6)))) {
    return true;
  }

  return cnaesSecundarios.some((cnae) =>
    cnaesAceitos.some((aceito) =>
      cnae.codigo.replace(/\D/g, "").startsWith(aceito.slice(0, 6)),
    ),
  );
}
