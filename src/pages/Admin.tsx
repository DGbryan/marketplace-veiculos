// src/pages/Admin.tsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

type Revenda = {
  id: string;
  nome: string;
  cnpj: string;
  cidade: string;
  email: string;
  telefone: string;
  status: string;
  created_at: string;
};

export default function Admin() {
  const [revendas, setRevendas] = useState<Revenda[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState<string | null>(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    buscarRevendas();
  }, []);

  async function buscarRevendas() {
    const { data } = await supabase
      .from("revendas")
      .select("*")
      .eq("status", "pendente")
      .order("created_at", { ascending: false });

    setRevendas(data || []);
    setCarregando(false);
  }

  async function atualizarStatus(id: string, status: "ativo" | "rejeitado") {
    setProcessando(id);

    await supabase.from("revendas").update({ status }).eq("id", id);

    setRevendas((prev) => prev.filter((r) => r.id !== id));
    setProcessando(null);
  }

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.headerTitulo}>RevCar — Admin</h1>
        <button onClick={handleLogout} style={styles.botaoLogout}>
          Sair
        </button>
      </header>

      <main style={styles.main}>
        <div style={styles.topo}>
          <h2 style={styles.titulo}>Revendas pendentes</h2>
          <span style={styles.badge}>
            {revendas.length} pendente{revendas.length !== 1 ? "s" : ""}
          </span>
        </div>

        {carregando ? (
          <p style={styles.mensagem}>Carregando...</p>
        ) : revendas.length === 0 ? (
          <div style={styles.vazio}>
            <p style={styles.vazioTexto}>Nenhuma revenda pendente</p>
            <p style={styles.vazioSub}>
              Todas as revendas já foram analisadas.
            </p>
          </div>
        ) : (
          <div style={styles.lista}>
            {revendas.map((revenda) => (
              <div key={revenda.id} style={styles.card}>
                <div style={styles.cardInfo}>
                  <h3 style={styles.cardNome}>{revenda.nome}</h3>
                  <div style={styles.cardDetalhes}>
                    <span style={styles.detalhe}>CNPJ: {revenda.cnpj}</span>
                    <span style={styles.detalhe}>Cidade: {revenda.cidade}</span>
                    <span style={styles.detalhe}>Email: {revenda.email}</span>
                    <span style={styles.detalhe}>Tel: {revenda.telefone}</span>
                  </div>
                  <span style={styles.data}>
                    Cadastrou em:{" "}
                    {new Date(revenda.created_at).toLocaleDateString("pt-BR")}
                  </span>
                </div>

                <div style={styles.cardAcoes}>
                  <button
                    onClick={() => atualizarStatus(revenda.id, "ativo")}
                    disabled={processando === revenda.id}
                    style={styles.botaoAprovar}
                  >
                    {processando === revenda.id ? "..." : "Aprovar"}
                  </button>
                  <button
                    onClick={() => atualizarStatus(revenda.id, "rejeitado")}
                    disabled={processando === revenda.id}
                    style={styles.botaoRejeitar}
                  >
                    {processando === revenda.id ? "..." : "Rejeitar"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f0f2f5",
  },
  header: {
    backgroundColor: "#1a1a2e",
    padding: "16px 32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitulo: {
    color: "#fff",
    fontSize: "18px",
    fontWeight: "600",
  },
  botaoLogout: {
    backgroundColor: "transparent",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.3)",
    padding: "6px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
  },
  main: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "32px 20px",
  },
  topo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "24px",
  },
  titulo: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#1a1a2e",
  },
  badge: {
    backgroundColor: "#1a1a2e",
    color: "#fff",
    fontSize: "12px",
    padding: "3px 10px",
    borderRadius: "99px",
  },
  mensagem: {
    color: "#888",
    textAlign: "center" as const,
  },
  vazio: {
    textAlign: "center" as const,
    padding: "60px 20px",
    backgroundColor: "#fff",
    borderRadius: "12px",
  },
  vazioTexto: {
    fontSize: "16px",
    fontWeight: "500",
    color: "#333",
    marginBottom: "6px",
  },
  vazioSub: {
    fontSize: "13px",
    color: "#888",
  },
  lista: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "12px",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "20px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  cardInfo: {
    flex: 1,
  },
  cardNome: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#1a1a2e",
    marginBottom: "8px",
  },
  cardDetalhes: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "8px",
    marginBottom: "8px",
  },
  detalhe: {
    fontSize: "12px",
    color: "#666",
    backgroundColor: "#f5f5f5",
    padding: "3px 8px",
    borderRadius: "4px",
  },
  data: {
    fontSize: "11px",
    color: "#aaa",
  },
  cardAcoes: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "8px",
  },
  botaoAprovar: {
    backgroundColor: "#2d7a3a",
    color: "#fff",
    border: "none",
    padding: "8px 20px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    minWidth: "90px",
  },
  botaoRejeitar: {
    backgroundColor: "#fff",
    color: "#e53e3e",
    border: "1px solid #e53e3e",
    padding: "8px 20px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    minWidth: "90px",
  },
};
