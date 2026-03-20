// src/pages/Cadastro.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";
import { buscarCNPJ, formatarTelefone, validarCNAE } from "../lib/brasilapi";

const schema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  cnpj: z.string().min(14, "CNPJ inválido").max(18, "CNPJ inválido"),
  cidade: z.string().min(2, "Informe a cidade"),
  telefone: z.string().min(10, "Telefone inválido"),
  email: z.string().email("Email inválido"),
  senha: z.string().min(6, "Mínimo 6 caracteres"),
});

type FormData = z.infer<typeof schema>;

export default function Cadastro() {
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [buscandoCNPJ, setBuscandoCNPJ] = useState(false);
  const [cnaeValido, setCnaeValido] = useState<boolean | null>(null);
  const [erroCNPJ, setErroCNPJ] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function handleBuscarCNPJ() {
    const cnpj = getValues("cnpj");
    if (!cnpj || cnpj.replace(/\D/g, "").length < 14) {
      setErroCNPJ("Digite o CNPJ completo antes de buscar");
      return;
    }

    setBuscandoCNPJ(true);
    setErroCNPJ("");
    setCnaeValido(null);

    try {
      const dados = await buscarCNPJ(cnpj);
      const situacao = String(dados.situacao_cadastral ?? "")
        .toUpperCase()
        .trim();
      if (situacao && situacao !== "ATIVA" && dados.situacao_cadastral !== 2) {
        setErroCNPJ("Este CNPJ está inativo na Receita Federal");
        setBuscandoCNPJ(false);
        return;
      }

      const cnaeOk = validarCNAE(dados.cnae_fiscal, dados.cnaes_secundarios);
      setCnaeValido(cnaeOk);
      setValue("nome", dados.razao_social);
      setValue("cidade", `${dados.municipio} - ${dados.uf}`);
      setValue("telefone", formatarTelefone(dados.ddd_telefone_1));
      if (dados.email) setValue("email", dados.email);

      if (!cnaeOk) {
        setErroCNPJ("Empresa não possui CNAE de revenda de veículos.");
      }
    } catch (e: any) {
      setErroCNPJ(e.message || "Erro ao buscar CNPJ.");
    }

    setBuscandoCNPJ(false);
  }

  async function onSubmit(data: FormData) {
    if (cnaeValido === false) {
      setErro(
        "Cadastro bloqueado: empresa não possui CNAE de revenda de veículos.",
      );
      return;
    }

    setCarregando(true);
    setErro("");

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.senha,
    });

    if (authError || !authData.user) {
      setErro("Erro ao criar conta. Tente novamente.");
      setCarregando(false);
      return;
    }

    const { data: revenda, error: revendaError } = await supabase
      .from("revendas")
      .insert({
        nome: data.nome,
        cnpj: data.cnpj,
        cidade: data.cidade,
        telefone: data.telefone,
        email: data.email,
        status: "pendente",
      })
      .select()
      .single();

    if (revendaError || !revenda) {
      setErro("Erro ao cadastrar revenda. Tente novamente.");
      setCarregando(false);
      return;
    }

    await supabase.from("usuarios").insert({
      id: authData.user.id,
      revenda_id: revenda.id,
      role: "revenda",
    });

    setSucesso(true);
    setCarregando(false);
  }

  if (sucesso) {
    return (
      <div style={styles.container}>
        <div style={styles.sucessoWrap}>
          <div style={styles.sucessoIcone}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path
                d="M6 14L11 19L22 8"
                stroke="#4ADE80"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 style={styles.sucessoTitulo}>Cadastro enviado!</h2>
          <p style={styles.sucessoTexto}>
            Seu cadastro foi recebido e está aguardando aprovação do admin. Você
            será notificado quando for aprovado.
          </p>
          <Link to="/" style={styles.botao}>
            Voltar para o login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.wrap}>
        <div style={styles.logo}>
          <div style={styles.logoIcone}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect width="20" height="20" rx="6" fill="#5B6AD0" />
              <path
                d="M6 10L8.5 12.5L14 7"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span style={styles.logoNome}>RevCar</span>
        </div>

        <div style={styles.textos}>
          <h1 style={styles.titulo}>Cadastre sua revenda</h1>
          <p style={styles.subtitulo}>
            Preencha o CNPJ para pré-carregar os dados automaticamente
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
          {/* CNPJ com busca */}
          <div style={styles.campo}>
            <label style={styles.label}>CNPJ</label>
            <div style={styles.cnpjRow}>
              <input
                {...register("cnpj")}
                placeholder="00.000.000/0000-00"
                style={{ ...styles.input, flex: 1 }}
              />
              <button
                type="button"
                onClick={handleBuscarCNPJ}
                disabled={buscandoCNPJ}
                style={styles.botaoBuscar}
              >
                {buscandoCNPJ ? "..." : "Buscar"}
              </button>
            </div>
            {errors.cnpj && (
              <span style={styles.erroMsg}>{errors.cnpj.message}</span>
            )}
            {erroCNPJ && <span style={styles.erroMsg}>{erroCNPJ}</span>}
            {cnaeValido === true && (
              <span style={styles.sucessoMsg}>✓ CNAE de revenda validado</span>
            )}
          </div>

          {/* Nome */}
          <div style={styles.campo}>
            <label style={styles.label}>Nome da revenda</label>
            <input
              {...register("nome")}
              placeholder="Preenchido automaticamente"
              style={styles.input}
            />
            {errors.nome && (
              <span style={styles.erroMsg}>{errors.nome.message}</span>
            )}
          </div>

          {/* Cidade e Telefone */}
          <div style={styles.grid2}>
            <div style={styles.campo}>
              <label style={styles.label}>Cidade</label>
              <input
                {...register("cidade")}
                placeholder="Preenchido automaticamente"
                style={styles.input}
              />
              {errors.cidade && (
                <span style={styles.erroMsg}>{errors.cidade.message}</span>
              )}
            </div>
            <div style={styles.campo}>
              <label style={styles.label}>Telefone</label>
              <input
                {...register("telefone")}
                placeholder="Preenchido automaticamente"
                style={styles.input}
              />
              {errors.telefone && (
                <span style={styles.erroMsg}>{errors.telefone.message}</span>
              )}
            </div>
          </div>

          {/* Email */}
          <div style={styles.campo}>
            <label style={styles.label}>Email</label>
            <input
              {...register("email")}
              type="email"
              placeholder="seu@email.com"
              style={styles.input}
            />
            {errors.email && (
              <span style={styles.erroMsg}>{errors.email.message}</span>
            )}
          </div>

          {/* Senha */}
          <div style={styles.campo}>
            <label style={styles.label}>Senha</label>
            <input
              {...register("senha")}
              type="password"
              placeholder="••••••••"
              style={styles.input}
            />
            {errors.senha && (
              <span style={styles.erroMsg}>{errors.senha.message}</span>
            )}
          </div>

          {erro && <p style={styles.erroGeral}>{erro}</p>}

          <button
            type="submit"
            disabled={carregando || cnaeValido === false}
            style={{
              ...styles.botao,
              opacity: cnaeValido === false ? 0.5 : 1,
              cursor: cnaeValido === false ? "not-allowed" : "pointer",
            }}
          >
            {carregando ? "Cadastrando..." : "Cadastrar revenda"}
          </button>
        </form>

        <p style={styles.rodape}>
          Já tem conta?{" "}
          <Link to="/" style={styles.link}>
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#0F0F0F",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
  },
  wrap: {
    width: "100%",
    maxWidth: "440px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  logoIcone: {
    display: "flex",
    alignItems: "center",
  },
  logoNome: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#FFFFFF",
  },
  textos: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  titulo: {
    fontSize: "22px",
    fontWeight: "600",
    color: "#FFFFFF",
    margin: 0,
  },
  subtitulo: {
    fontSize: "13px",
    color: "rgba(255,255,255,0.4)",
    margin: 0,
    lineHeight: 1.5,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  cnpjRow: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  campo: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "12px",
    fontWeight: "500",
    color: "rgba(255,255,255,0.5)",
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "8px",
    padding: "10px 14px",
    color: "#FFFFFF",
    fontSize: "13px",
    outline: "none",
  },
  botaoBuscar: {
    backgroundColor: "rgba(91,106,208,0.15)",
    border: "1px solid rgba(91,106,208,0.3)",
    borderRadius: "8px",
    color: "#8B96E9",
    fontSize: "13px",
    fontWeight: "500",
    padding: "10px 16px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  erroMsg: {
    fontSize: "11px",
    color: "#F87171",
  },
  sucessoMsg: {
    fontSize: "11px",
    color: "#4ADE80",
    fontWeight: "500",
  },
  erroGeral: {
    fontSize: "12px",
    color: "#F87171",
    backgroundColor: "rgba(248,113,113,0.08)",
    border: "1px solid rgba(248,113,113,0.15)",
    padding: "10px 14px",
    borderRadius: "8px",
    margin: 0,
  },
  botao: {
    backgroundColor: "#5B6AD0",
    color: "#fff",
    border: "none",
    padding: "11px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    textAlign: "center",
    textDecoration: "none",
    display: "block",
    marginTop: "4px",
  },
  rodape: {
    fontSize: "13px",
    color: "rgba(255,255,255,0.3)",
    textAlign: "center",
    margin: 0,
  },
  link: {
    color: "#8B96E9",
    textDecoration: "none",
    fontWeight: "500",
  },
  sucessoWrap: {
    width: "100%",
    maxWidth: "400px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
    textAlign: "center",
  },
  sucessoIcone: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    backgroundColor: "rgba(74,222,128,0.1)",
    border: "1px solid rgba(74,222,128,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  sucessoTitulo: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#FFFFFF",
    margin: 0,
  },
  sucessoTexto: {
    fontSize: "13px",
    color: "rgba(255,255,255,0.4)",
    lineHeight: 1.6,
    margin: 0,
  },
};
