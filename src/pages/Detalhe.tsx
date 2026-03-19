// src/pages/Detalhe.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

type Veiculo = {
  id: string;
  marca: string;
  modelo: string;
  ano: number;
  preco: number;
  km: number;
  cidade: string;
  descricao: string;
  created_at: string;
  revendas: {
    nome: string;
    telefone: string;
    cidade: string;
    email: string;
  };
};

export default function Detalhe() {
  const [veiculo, setVeiculo] = useState<Veiculo | null>(null);
  const [carregando, setCarregando] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) buscarVeiculo();
  }, [id]);

  async function buscarVeiculo() {
    const { data } = await supabase
      .from("veiculos")
      .select("*, revendas(nome, telefone, cidade, email)")
      .eq("id", id)
      .single();

    setVeiculo(data);
    setCarregando(false);
  }

  function abrirWhatsApp() {
    if (!veiculo) return;
    const mensagem = `Olá! Vi o anúncio do ${veiculo.marca} ${veiculo.modelo} ${veiculo.ano} por R$ ${veiculo.preco.toLocaleString("pt-BR")} no RevCar. Tenho interesse!`;
    const numero = veiculo.revendas.telefone.replace(/\D/g, "");
    window.open(
      `https://wa.me/55${numero}?text=${encodeURIComponent(mensagem)}`,
      "_blank",
    );
  }

  if (carregando) {
    return (
      <div style={styles.loading}>
        <p>Carregando...</p>
      </div>
    );
  }

  if (!veiculo) {
    return (
      <div style={styles.loading}>
        <p>Veículo não encontrado.</p>
        <button
          onClick={() => navigate("/catalogo")}
          style={styles.botaoVoltar}
        >
          Voltar ao catálogo
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <main style={styles.main}>
        <button
          onClick={() => navigate("/catalogo")}
          style={styles.botaoVoltar}
        >
          ← Voltar ao catálogo
        </button>

        <div style={styles.grid}>
          <div style={styles.colEsquerda}>
            <div style={styles.fotoPlaceholder}>
              <span style={styles.fotoTexto}>
                {veiculo.marca} {veiculo.modelo}
              </span>
            </div>
          </div>

          <div style={styles.colDireita}>
            <div style={styles.card}>
              <div style={styles.cardTopo}>
                <h2 style={styles.titulo}>
                  {veiculo.marca} {veiculo.modelo}
                </h2>
                <span style={styles.ano}>{veiculo.ano}</span>
              </div>

              <div style={styles.preco}>
                R$ {veiculo.preco.toLocaleString("pt-BR")}
              </div>

              <div style={styles.specs}>
                <div style={styles.spec}>
                  <span style={styles.specLabel}>Quilometragem</span>
                  <span style={styles.specValor}>
                    {veiculo.km.toLocaleString("pt-BR")} km
                  </span>
                </div>
                <div style={styles.spec}>
                  <span style={styles.specLabel}>Cidade</span>
                  <span style={styles.specValor}>{veiculo.cidade}</span>
                </div>
                <div style={styles.spec}>
                  <span style={styles.specLabel}>Anunciado em</span>
                  <span style={styles.specValor}>
                    {new Date(veiculo.created_at).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </div>

              {veiculo.descricao && (
                <div style={styles.descricaoBox}>
                  <p style={styles.descricaoLabel}>Descrição</p>
                  <p style={styles.descricaoTexto}>{veiculo.descricao}</p>
                </div>
              )}

              <div style={styles.revendaBox}>
                <p style={styles.revendaLabel}>Anunciado por</p>
                <p style={styles.revendaNome}>{veiculo.revendas.nome}</p>
                <p style={styles.revendaCidade}>{veiculo.revendas.cidade}</p>
              </div>

              <button onClick={abrirWhatsApp} style={styles.botaoWhatsApp}>
                Entrar em contato via WhatsApp
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const styles = {
  loading: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    gap: "16px",
    backgroundColor: "#f0f2f5",
  },
  container: { minHeight: "100vh", backgroundColor: "#f0f2f5" },
  main: { maxWidth: "1000px", margin: "0 auto", padding: "32px 20px" },
  botaoVoltar: {
    backgroundColor: "transparent",
    color: "#1a1a2e",
    border: "1px solid #ddd",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    marginBottom: "24px",
    display: "inline-block",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "24px",
    alignItems: "start",
  },
  colEsquerda: {},
  fotoPlaceholder: {
    backgroundColor: "#1a1a2e",
    borderRadius: "12px",
    height: "320px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  fotoTexto: {
    color: "rgba(255,255,255,0.3)",
    fontSize: "18px",
    fontWeight: "500",
    textAlign: "center" as const,
  },
  colDireita: {},
  card: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column" as const,
    gap: "16px",
  },
  cardTopo: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  titulo: { fontSize: "20px", fontWeight: "700", color: "#1a1a2e" },
  ano: {
    backgroundColor: "#f5f5f5",
    color: "#666",
    fontSize: "13px",
    padding: "4px 10px",
    borderRadius: "6px",
  },
  preco: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#2d7a3a",
  },
  specs: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    padding: "16px",
    backgroundColor: "#f8f8f8",
    borderRadius: "8px",
  },
  spec: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "3px",
  },
  specLabel: {
    fontSize: "11px",
    color: "#999",
    textTransform: "uppercase" as const,
  },
  specValor: { fontSize: "14px", fontWeight: "500", color: "#333" },
  descricaoBox: {
    borderTop: "1px solid #f0f0f0",
    paddingTop: "16px",
  },
  descricaoLabel: { fontSize: "12px", color: "#999", marginBottom: "6px" },
  descricaoTexto: { fontSize: "14px", color: "#555", lineHeight: "1.6" },
  revendaBox: {
    backgroundColor: "#f0f2f5",
    borderRadius: "8px",
    padding: "14px",
  },
  revendaLabel: { fontSize: "11px", color: "#999", marginBottom: "4px" },
  revendaNome: { fontSize: "15px", fontWeight: "600", color: "#1a1a2e" },
  revendaCidade: { fontSize: "12px", color: "#888", marginTop: "2px" },
  botaoWhatsApp: {
    backgroundColor: "#25D366",
    color: "#fff",
    border: "none",
    padding: "14px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600",
    width: "100%",
  },
};
