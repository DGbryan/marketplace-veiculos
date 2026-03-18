// src/pages/Login.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "../lib/supabase";
import { useNavigate, Link } from "react-router-dom";

const schema = z.object({
  email: z.string().email("Email inválido"),
  senha: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

type FormData = z.infer<typeof schema>;

export default function Login() {
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

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

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.senha,
    });

    if (error) {
      setErro("Email ou senha incorretos");
      setCarregando(false);
      return;
    }

    const { data: usuario } = await supabase
      .from("usuarios")
      .select("role")
      .eq("id", authData.user.id)
      .single();

    if (usuario?.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/painel");
    }

    setCarregando(false);
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.titulo}>RevCar</h1>
        <p style={styles.subtitulo}>Acesse sua conta</p>

        <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
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
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p style={styles.link}>
          Não tem conta?{" "}
          <Link to="/cadastro" style={styles.linkTexto}>
            Cadastre sua revenda
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
  },
  card: {
    backgroundColor: "#fff",
    padding: "40px",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "400px",
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
};
