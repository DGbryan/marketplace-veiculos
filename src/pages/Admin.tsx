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

type Veiculo = {
  id: string;
  marca: string;
  modelo: string;
  ano: number;
  preco: number;
  cidade: string;
  status: string;
  created_at: string;
  revendas: { nome: string };
};

type Metricas = {
  revendasAtivas: number;
  revendasPendentes: number;
  veiculosAtivos: number;
};

type Aba = "pendentes" | "ativas" | "veiculos";

export default function Admin() {
  const [revendasPendentes, setRevendasPendentes] = useState<Revenda[]>([]);
  const [revendasAtivas, setRevendasAtivas] = useState<Revenda[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [metricas, setMetricas] = useState<Metricas>({
    revendasAtivas: 0,
    revendasPendentes: 0,
    veiculosAtivos: 0,
  });
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState<string | null>(null);
  const [abaAtiva, setAbaAtiva] = useState<Aba>("pendentes");
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    buscarDados();
  }, []);

  async function buscarDados() {
    const [{ data: pendentes }, { data: ativas }, { data: veiculosData }] =
      await Promise.all([
        supabase
          .from("revendas")
          .select("*")
          .eq("status", "pendente")
          .order("created_at", { ascending: false }),
        supabase
          .from("revendas")
          .select("*")
          .eq("status", "ativo")
          .order("created_at", { ascending: false }),
        supabase
          .from("veiculos")
          .select("*, revendas(nome)")
          .eq("status", "ativo")
          .order("created_at", { ascending: false }),
      ]);

    setRevendasPendentes(pendentes || []);
    setRevendasAtivas(ativas || []);
    setVeiculos(veiculosData || []);
    setMetricas({
      revendasAtivas: ativas?.length || 0,
      revendasPendentes: pendentes?.length || 0,
      veiculosAtivos: veiculosData?.length || 0,
    });
    setCarregando(false);
  }

  async function atualizarStatus(id: string, status: "ativo" | "rejeitado") {
    setProcessando(id);
    await supabase.from("revendas").update({ status }).eq("id", id);
    await buscarDados();
    setProcessando(null);
  }

  async function removerVeiculo(id: string) {
    setProcessando(id);
    await supabase.from("veiculos").update({ status: "pausado" }).eq("id", id);
    setVeiculos((prev) => prev.filter((v) => v.id !== id));
    setMetricas((prev) => ({
      ...prev,
      veiculosAtivos: prev.veiculosAtivos - 1,
    }));
    setProcessando(null);
  }

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  const abas: { id: Aba; label: string; count: number }[] = [
    { id: "pendentes", label: "Pendentes", count: metricas.revendasPendentes },
    { id: "ativas", label: "Revendas ativas", count: metricas.revendasAtivas },
    { id: "veiculos", label: "Anuncios", count: metricas.veiculosAtivos },
  ];

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerEsquerda}>
          <div style={styles.logoWrap}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect width="18" height="18" rx="5" fill="#5B6AD0" />
              <path
                d="M5 9L7.5 11.5L13 6.5"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <p style={styles.logoNome}>RevCar</p>
            <p style={styles.logoSub}>Painel Admin</p>
          </div>
        </div>
        <button onClick={handleLogout} style={styles.botaoSair}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M5 2H3C2.44772 2 2 2.44772 2 3V11C2 11.5523 2.44772 12 3 12H5M9 10L12 7M12 7L9 4M12 7H5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Sair
        </button>
      </header>

      <div style={styles.conteudo}>
        {/* Métricas */}
        <div style={styles.metricas}>
          <div style={styles.metricaCard}>
            <p style={styles.metricaValor}>{metricas.revendasAtivas}</p>
            <p style={styles.metricaLabel}>Revendas ativas</p>
          </div>
          <div style={styles.metricaCard}>
            <p
              style={{
                ...styles.metricaValor,
                color: metricas.revendasPendentes > 0 ? "#FBBF24" : "#FFFFFF",
              }}
            >
              {metricas.revendasPendentes}
            </p>
            <p style={styles.metricaLabel}>Aguardando aprovacao</p>
          </div>
          <div style={styles.metricaCard}>
            <p style={styles.metricaValor}>{metricas.veiculosAtivos}</p>
            <p style={styles.metricaLabel}>Veiculos anunciados</p>
          </div>
        </div>

        {/* Abas */}
        <div style={styles.abas}>
          {abas.map((aba) => (
            <button
              key={aba.id}
              onClick={() => setAbaAtiva(aba.id)}
              style={{
                ...styles.aba,
                ...(abaAtiva === aba.id ? styles.abaAtiva : {}),
              }}
            >
              {aba.label}
              <span
                style={{
                  ...styles.abaBadge,
                  ...(abaAtiva === aba.id ? styles.abaBadgeAtiva : {}),
                }}
              >
                {aba.count}
              </span>
            </button>
          ))}
        </div>

        {carregando ? (
          <div style={styles.estado}>
            <p style={styles.estadoTexto}>Carregando...</p>
          </div>
        ) : (
          <>
            {/* Aba Pendentes */}
            {abaAtiva === "pendentes" && (
              <div style={styles.lista}>
                {revendasPendentes.length === 0 ? (
                  <div style={styles.estado}>
                    <p style={styles.estadoTexto}>Nenhuma revenda pendente</p>
                    <p style={styles.estadoSub}>
                      Todas as revendas foram analisadas
                    </p>
                  </div>
                ) : (
                  revendasPendentes.map((revenda, i) => (
                    <div
                      key={revenda.id}
                      style={{
                        ...styles.item,
                        ...(i > 0
                          ? { borderTop: "1px solid rgba(255,255,255,0.06)" }
                          : {}),
                      }}
                    >
                      <div style={styles.itemAvatar}>
                        {revenda.nome.slice(0, 2).toUpperCase()}
                      </div>
                      <div style={styles.itemInfo}>
                        <p style={styles.itemNome}>{revenda.nome}</p>
                        <div style={styles.itemTags}>
                          <span style={styles.tag}>CNPJ: {revenda.cnpj}</span>
                          <span style={styles.tag}>{revenda.cidade}</span>
                          <span style={styles.tag}>{revenda.email}</span>
                        </div>
                        <p style={styles.itemData}>
                          Cadastrou em{" "}
                          {new Date(revenda.created_at).toLocaleDateString(
                            "pt-BR",
                          )}
                        </p>
                      </div>
                      <div style={styles.itemAcoes}>
                        <button
                          onClick={() => atualizarStatus(revenda.id, "ativo")}
                          disabled={processando === revenda.id}
                          style={styles.botaoAprovar}
                        >
                          {processando === revenda.id ? "..." : "Aprovar"}
                        </button>
                        <button
                          onClick={() =>
                            atualizarStatus(revenda.id, "rejeitado")
                          }
                          disabled={processando === revenda.id}
                          style={styles.botaoRejeitar}
                        >
                          Rejeitar
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Aba Revendas ativas */}
            {abaAtiva === "ativas" && (
              <div style={styles.lista}>
                {revendasAtivas.length === 0 ? (
                  <div style={styles.estado}>
                    <p style={styles.estadoTexto}>Nenhuma revenda ativa</p>
                  </div>
                ) : (
                  revendasAtivas.map((revenda, i) => (
                    <div
                      key={revenda.id}
                      style={{
                        ...styles.item,
                        ...(i > 0
                          ? { borderTop: "1px solid rgba(255,255,255,0.06)" }
                          : {}),
                      }}
                    >
                      <div style={styles.itemAvatar}>
                        {revenda.nome.slice(0, 2).toUpperCase()}
                      </div>
                      <div style={styles.itemInfo}>
                        <p style={styles.itemNome}>{revenda.nome}</p>
                        <div style={styles.itemTags}>
                          <span style={styles.tag}>{revenda.cnpj}</span>
                          <span style={styles.tag}>{revenda.cidade}</span>
                          <span style={styles.tag}>{revenda.email}</span>
                        </div>
                        <p style={styles.itemData}>
                          Desde{" "}
                          {new Date(revenda.created_at).toLocaleDateString(
                            "pt-BR",
                          )}
                        </p>
                      </div>
                      <span style={styles.badgeAtivo}>Ativa</span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Aba Veiculos */}
            {abaAtiva === "veiculos" && (
              <div style={styles.lista}>
                {veiculos.length === 0 ? (
                  <div style={styles.estado}>
                    <p style={styles.estadoTexto}>Nenhum veiculo anunciado</p>
                  </div>
                ) : (
                  veiculos.map((veiculo, i) => (
                    <div
                      key={veiculo.id}
                      style={{
                        ...styles.item,
                        ...(i > 0
                          ? { borderTop: "1px solid rgba(255,255,255,0.06)" }
                          : {}),
                      }}
                    >
                      <div style={styles.itemInfo}>
                        <div style={styles.veiculoHeader}>
                          <p style={styles.veiculoMarca}>{veiculo.marca}</p>
                          <p style={styles.itemNome}>
                            {veiculo.modelo} {veiculo.ano}
                          </p>
                        </div>
                        <div style={styles.itemTags}>
                          <span style={styles.tag}>
                            {veiculo.revendas.nome}
                          </span>
                          <span style={styles.tag}>{veiculo.cidade}</span>
                          <span style={styles.tagPreco}>
                            R$ {veiculo.preco.toLocaleString("pt-BR")}
                          </span>
                        </div>
                        <p style={styles.itemData}>
                          Anunciado em{" "}
                          {new Date(veiculo.created_at).toLocaleDateString(
                            "pt-BR",
                          )}
                        </p>
                      </div>
                      <button
                        onClick={() => removerVeiculo(veiculo.id)}
                        disabled={processando === veiculo.id}
                        style={styles.botaoRemover}
                      >
                        {processando === veiculo.id ? "..." : "Pausar"}
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#0F0F0F",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 32px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    backgroundColor: "#111111",
  },
  headerEsquerda: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  logoWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  logoNome: {
    color: "#FFFFFF",
    fontSize: "14px",
    fontWeight: "600",
    margin: 0,
    lineHeight: 1.3,
  },
  logoSub: {
    color: "rgba(255,255,255,0.25)",
    fontSize: "10px",
    margin: 0,
    lineHeight: 1.3,
  },
  botaoSair: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "transparent",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "6px",
    color: "rgba(255,255,255,0.35)",
    fontSize: "12px",
    padding: "6px 12px",
    cursor: "pointer",
  },
  conteudo: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "32px 24px",
    width: "100%",
  },
  metricas: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
    marginBottom: "32px",
  },
  metricaCard: {
    backgroundColor: "#1A1A1A",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "10px",
    padding: "20px",
  },
  metricaValor: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#FFFFFF",
    margin: "0 0 4px",
    lineHeight: 1,
  },
  metricaLabel: {
    fontSize: "12px",
    color: "rgba(255,255,255,0.35)",
    margin: 0,
  },
  abas: {
    display: "flex",
    gap: "2px",
    marginBottom: "4px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  aba: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 16px",
    backgroundColor: "transparent",
    border: "none",
    borderBottom: "2px solid transparent",
    color: "rgba(255,255,255,0.35)",
    fontSize: "13px",
    cursor: "pointer",
    marginBottom: "-1px",
  },
  abaAtiva: {
    color: "#FFFFFF",
    borderBottomColor: "#5B6AD0",
  },
  abaBadge: {
    backgroundColor: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.3)",
    fontSize: "10px",
    padding: "2px 7px",
    borderRadius: "99px",
  },
  abaBadgeAtiva: {
    backgroundColor: "rgba(91,106,208,0.2)",
    color: "#8B96E9",
  },
  lista: {
    display: "flex",
    flexDirection: "column",
    paddingTop: "8px",
  },
  item: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "16px 0",
  },
  itemAvatar: {
    width: "36px",
    height: "36px",
    borderRadius: "8px",
    backgroundColor: "#5B6AD0",
    color: "#fff",
    fontSize: "12px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  itemInfo: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  itemNome: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#FFFFFF",
    margin: 0,
  },
  itemTags: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
  },
  tag: {
    fontSize: "11px",
    color: "rgba(255,255,255,0.4)",
    backgroundColor: "rgba(255,255,255,0.06)",
    padding: "3px 8px",
    borderRadius: "4px",
  },
  tagPreco: {
    fontSize: "11px",
    color: "#4ADE80",
    backgroundColor: "rgba(74,222,128,0.1)",
    padding: "3px 8px",
    borderRadius: "4px",
  },
  itemData: {
    fontSize: "11px",
    color: "rgba(255,255,255,0.2)",
    margin: 0,
  },
  itemAcoes: {
    display: "flex",
    gap: "8px",
    flexShrink: 0,
  },
  botaoAprovar: {
    backgroundColor: "rgba(74,222,128,0.1)",
    border: "1px solid rgba(74,222,128,0.2)",
    borderRadius: "6px",
    color: "#4ADE80",
    fontSize: "12px",
    fontWeight: "500",
    padding: "6px 14px",
    cursor: "pointer",
  },
  botaoRejeitar: {
    backgroundColor: "transparent",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "6px",
    color: "rgba(255,255,255,0.3)",
    fontSize: "12px",
    padding: "6px 14px",
    cursor: "pointer",
  },
  botaoRemover: {
    backgroundColor: "transparent",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "6px",
    color: "rgba(255,255,255,0.3)",
    fontSize: "12px",
    padding: "6px 14px",
    cursor: "pointer",
    flexShrink: 0,
  },
  badgeAtivo: {
    fontSize: "11px",
    color: "#4ADE80",
    backgroundColor: "rgba(74,222,128,0.1)",
    border: "1px solid rgba(74,222,128,0.15)",
    padding: "4px 10px",
    borderRadius: "99px",
    flexShrink: 0,
  },
  veiculoHeader: {
    display: "flex",
    alignItems: "baseline",
    gap: "8px",
  },
  veiculoMarca: {
    fontSize: "10px",
    color: "rgba(255,255,255,0.25)",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    margin: 0,
  },
  estado: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "60px 0",
    gap: "6px",
  },
  estadoTexto: {
    color: "rgba(255,255,255,0.35)",
    fontSize: "14px",
    margin: 0,
  },
  estadoSub: {
    color: "rgba(255,255,255,0.2)",
    fontSize: "12px",
    margin: 0,
  },
};
