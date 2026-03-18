// src/pages/Cadastro.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";

const schema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  cnpj: z.string().min(14, "CNPJ inválido").max(18, "CNPJ inválido"),
  cidade: z.string().min(2, "Informe a cidade"),
  telefone: z.string().min(10, "Telefone inválido"),
  email: z.string().email("Email inválido"),
  senha: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

type FormData = z.infer<typeof schema>;

export default function Cadastro() {
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setCarregando(true);
    setErro("");

    // 1. Cria o usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.senha,
    });

    if (authError || !authData.user) {
      setErro("Erro ao criar conta. Tente novamente.");
      setCarregando(false);
      return;
    }

    // 2. Cria a revenda na tabela revendas
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

    // 3. Cria o registro na tabela usuarios
    const { error: usuarioError } = await supabase.from("usuarios").insert({
      id: authData.user.id,
      revenda_id: revenda.id,
      role: "revenda",
    });

    if (usuarioError) {
      setErro("Erro ao finalizar cadastro. Tente novamente.");
      setCarregando(false);
      return;
    }

    setSucesso(true);
    setCarregando(false);
  }

  if (sucesso) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.sucessoIcone}>✓</div>
          <h2 style={styles.sucessoTitulo}>Cadastro enviado!</h2>
          <p style={styles.sucessoTexto}>
            Seu cadastro foi recebido e está aguardando aprovação. Você receberá
            um email quando for aprovado.
          </p>
          <Link to="/" style={styles.botaoLink}>
            Voltar para o login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.titulo}>RevCar</h1>
        <p style={styles.subtitulo}>Cadastre sua revenda</p>

        <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
          <div style={styles.campo}>
            <label style={styles.label}>Nome da revenda</label>
            <input
              {...register("nome")}
              placeholder="Ex: Auto Center Silva"
              style={styles.input}
            />
            {errors.nome && (
              <span style={styles.erro}>{errors.nome.message}</span>
            )}
          </div>

          <div style={styles.campo}>
            <label style={styles.label}>CNPJ</label>
            <input
              {...register("cnpj")}
              placeholder="00.000.000/0000-00"
              style={styles.input}
            />
            {errors.cnpj && (
              <span style={styles.erro}>{errors.cnpj.message}</span>
            )}
          </div>

          <div style={styles.grid}>
            <div style={styles.campo}>
              <label style={styles.label}>Cidade</label>
              <input
                {...register("cidade")}
                placeholder="Ex: Florianópolis"
                style={styles.input}
              />
              {errors.cidade && (
                <span style={styles.erro}>{errors.cidade.message}</span>
              )}
            </div>

            <div style={styles.campo}>
              <label style={styles.label}>Telefone</label>
              <input
                {...register("telefone")}
                placeholder="(48) 99999-9999"
                style={styles.input}
              />
              {errors.telefone && (
                <span style={styles.erro}>{errors.telefone.message}</span>
              )}
            </div>
          </div>

          <div style={styles.campo}>
            <label style={styles.label}>Email</label>
            <input
              {...register("email")}
              type="email"
              placeholder="seu@email.com"
              style={styles.input}
            />
            {errors.email && (
              <span style={styles.erro}>{errors.email.message}</span>
            )}
          </div>

          <div style={styles.campo}>
            <label style={styles.label}>Senha</label>
            <input
              {...register("senha")}
              type="password"
              placeholder="••••••"
              style={styles.input}
            />
            {errors.senha && (
              <span style={styles.erro}>{errors.senha.message}</span>
            )}
          </div>

          {erro && <p style={styles.erroGeral}>{erro}</p>}

          <button type="submit" disabled={carregando} style={styles.botao}>
            {carregando ? "Cadastrando..." : "Cadastrar revenda"}
          </button>
        </form>

        <p style={styles.link}>
          Já tem conta?{" "}
          <Link to="/" style={styles.linkTexto}>
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f2f5",
    padding: "20px",
  },
  card: {
    backgroundColor: "#fff",
    padding: "40px",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "480px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
  },
  titulo: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#1a1a2e",
    textAlign: "center" as const,
    marginBottom: "4px",
  },
  subtitulo: {
    fontSize: "14px",
    color: "#888",
    textAlign: "center" as const,
    marginBottom: "28px",
  },
  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "16px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  campo: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "6px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#333",
  },
  input: {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
    outline: "none",
  },
  erro: {
    fontSize: "12px",
    color: "#e53e3e",
  },
  erroGeral: {
    fontSize: "13px",
    color: "#e53e3e",
    textAlign: "center" as const,
    backgroundColor: "#fff5f5",
    padding: "8px",
    borderRadius: "6px",
  },
  botao: {
    padding: "12px",
    backgroundColor: "#1a1a2e",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "500",
    cursor: "pointer",
    marginTop: "4px",
  },
  link: {
    textAlign: "center" as const,
    fontSize: "13px",
    color: "#888",
    marginTop: "20px",
  },
  linkTexto: {
    color: "#1a1a2e",
    fontWeight: "500",
  },
  sucessoIcone: {
    width: "56px",
    height: "56px",
    backgroundColor: "#e6f4ea",
    color: "#2d7a3a",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    margin: "0 auto 16px",
  },
  sucessoTitulo: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#1a1a2e",
    textAlign: "center" as const,
    marginBottom: "8px",
  },
  sucessoTexto: {
    fontSize: "14px",
    color: "#666",
    textAlign: "center" as const,
    lineHeight: "1.6",
    marginBottom: "24px",
  },
  botaoLink: {
    display: "block",
    padding: "12px",
    backgroundColor: "#1a1a2e",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "500",
    cursor: "pointer",
    textAlign: "center" as const,
    textDecoration: "none",
  },
};
