// src/components/PublicLayout.tsx
import { useNavigate } from "react-router-dom";

type Props = {
  children: React.ReactNode;
};

export default function PublicLayout({ children }: Props) {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <span style={styles.logo}>RevCar</span>
        <div style={styles.headerAcoes}>
          <span style={styles.headerTexto}>Marketplace B2B de Veículos</span>
          <button onClick={() => navigate("/")} style={styles.botaoLogin}>
            Entrar como revenda
          </button>
        </div>
      </header>

      <main>{children}</main>

      <footer style={styles.footer}>
        <p style={styles.footerTexto}>
          RevCar B2B — Plataforma exclusiva para revendas de veículos
        </p>
      </footer>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", backgroundColor: "#f0f2f5" },
  header: {
    backgroundColor: "#1a1a2e",
    padding: "16px 40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: {
    color: "#fff",
    fontSize: "22px",
    fontWeight: "700",
  },
  headerAcoes: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  headerTexto: {
    color: "rgba(255,255,255,0.45)",
    fontSize: "13px",
  },
  botaoLogin: {
    backgroundColor: "#fff",
    color: "#1a1a2e",
    border: "none",
    padding: "8px 18px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
  },
  footer: {
    backgroundColor: "#1a1a2e",
    padding: "20px 40px",
    marginTop: "60px",
  },
  footerTexto: {
    color: "rgba(255,255,255,0.3)",
    fontSize: "12px",
    textAlign: "center" as const,
  },
};
