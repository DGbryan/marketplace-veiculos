// src/pages/Login.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "../lib/supabase";
import { useNavigate, Link } from "react-router-dom";

const schema = z.object({
  email: z.string().email("Email inválido"),
  senha: z.string().min(6, "Mínimo 6 caracteres"),
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
      navigate("/catalogo");
    }

    setCarregando(false);
  }

  return (
    <div style={styles.container}>
      <div style={styles.esquerda}>
        <div style={styles.esquerdaConteudo}>
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
            <h1 style={styles.titulo}>Bem-vindo de volta</h1>
            <p style={styles.subtitulo}>
              Entre na sua conta para acessar o marketplace B2B
            </p>
          </div>

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
                <span style={styles.erroMsg}>{errors.email.message}</span>
              )}
            </div>

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

            <button type="submit" disabled={carregando} style={styles.botao}>
              {carregando ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p style={styles.rodape}>
            Não tem conta?{" "}
            <Link to="/cadastro" style={styles.link}>
              Cadastre sua revenda
            </Link>
          </p>

          <p style={styles.rodape}>
            <Link to="/home" style={styles.linkSutil}>
              Ver vitrine pública →
            </Link>
          </p>
        </div>
      </div>

      <div style={styles.direita}>
        <div style={styles.direitaConteudo}>
          <div style={styles.destaque}>
            <p style={styles.destaqueNumero}>B2B</p>
            <p style={styles.destaqueTitulo}>
              Marketplace exclusivo para revendas
            </p>
            <p style={styles.destaqueSub}>
              Compre e venda veículos com preço de atacado diretamente com
              outras revendas.
            </p>
          </div>
          <div style={styles.features}>
            {[
              "Preços de atacado entre revendas",
              "Validação automática de CNPJ e CNAE",
              "Chat direto entre revendas",
              "Catálogo completo com filtros",
            ].map((f, i) => (
              <div key={i} style={styles.featureItem}>
                <div style={styles.featureIcone}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2 6L5 9L10 3"
                      stroke="#4ADE80"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span style={styles.featureTexto}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    minHeight: "100vh",
    backgroundColor: "#0F0F0F",
  },
  esquerda: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
    borderRight: "1px solid rgba(255,255,255,0.06)",
  },
  esquerdaConteudo: {
    width: "100%",
    maxWidth: "360px",
    display: "flex",
    flexDirection: "column",
    gap: "28px",
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
    fontSize: "14px",
    outline: "none",
  },
  erroMsg: {
    fontSize: "11px",
    color: "#F87171",
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
  linkSutil: {
    color: "rgba(255,255,255,0.25)",
    textDecoration: "none",
    fontSize: "12px",
  },
  direita: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
    backgroundColor: "#111111",
  },
  direitaConteudo: {
    maxWidth: "380px",
    display: "flex",
    flexDirection: "column",
    gap: "32px",
  },
  destaque: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  destaqueNumero: {
    fontSize: "11px",
    color: "#5B6AD0",
    fontWeight: "600",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    margin: 0,
  },
  destaqueTitulo: {
    fontSize: "24px",
    fontWeight: "600",
    color: "#FFFFFF",
    margin: 0,
    lineHeight: 1.3,
  },
  destaqueSub: {
    fontSize: "14px",
    color: "rgba(255,255,255,0.4)",
    margin: 0,
    lineHeight: 1.6,
  },
  features: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  featureIcone: {
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    backgroundColor: "rgba(74,222,128,0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  featureTexto: {
    fontSize: "13px",
    color: "rgba(255,255,255,0.5)",
  },
};
