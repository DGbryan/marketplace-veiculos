// src/pages/Catalogo.tsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

type Veiculo = {
  id: string;
  marca: string;
  modelo: string;
  ano: number;
  preco: number;
  km: number;
  cidade: string;
  descricao: string;
  revendas: {
    nome: string;
    telefone: string;
  };
};

export default function Catalogo() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [filtrados, setFiltrados] = useState<Veiculo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [marca, setMarca] = useState("");
  const [cidade, setCidade] = useState("");
  const [precoMax, setPrecoMax] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    buscarVeiculos();
  }, []);
  useEffect(() => {
    filtrar();
  }, [marca, cidade, precoMax, veiculos]);

  async function buscarVeiculos() {
    const { data } = await supabase
      .from("veiculos")
      .select("*, revendas(nome, telefone)")
      .eq("status", "ativo")
      .order("created_at", { ascending: false });
    setVeiculos(data || []);
    setFiltrados(data || []);
    setCarregando(false);
  }

  function filtrar() {
    let r = [...veiculos];
    if (marca)
      r = r.filter((v) => v.marca.toLowerCase().includes(marca.toLowerCase()));
    if (cidade)
      r = r.filter((v) =>
        v.cidade.toLowerCase().includes(cidade.toLowerCase()),
      );
    if (precoMax) r = r.filter((v) => v.preco <= parseFloat(precoMax));
    setFiltrados(r);
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerTopo}>
          <div style={styles.headerEsquerda}>
            <h1 style={styles.titulo}>Catálogo</h1>
            <span style={styles.contador}>{filtrados.length}</span>
          </div>
        </div>

        <div style={styles.filtros}>
          <div style={styles.filtroWrapper}>
            <svg
              style={styles.filtroIcone}
              width="13"
              height="13"
              viewBox="0 0 13 13"
              fill="none"
            >
              <circle
                cx="5.5"
                cy="5.5"
                r="4"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="1.5"
              />
              <path
                d="M9 9L11.5 11.5"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <input
              type="text"
              placeholder="Marca..."
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
              style={styles.filtroInput}
            />
          </div>
          <div style={styles.filtroWrapper}>
            <svg
              style={styles.filtroIcone}
              width="13"
              height="13"
              viewBox="0 0 13 13"
              fill="none"
            >
              <path
                d="M6.5 1.5C4.567 1.5 3 3.067 3 5C3 7.5 6.5 11.5 6.5 11.5C6.5 11.5 10 7.5 10 5C10 3.067 8.433 1.5 6.5 1.5Z"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="1.5"
              />
              <circle cx="6.5" cy="5" r="1" fill="rgba(255,255,255,0.3)" />
            </svg>
            <input
              type="text"
              placeholder="Cidade..."
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              style={styles.filtroInput}
            />
          </div>
          <div style={styles.filtroWrapper}>
            <svg
              style={styles.filtroIcone}
              width="13"
              height="13"
              viewBox="0 0 13 13"
              fill="none"
            >
              <circle
                cx="6.5"
                cy="6.5"
                r="5"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="1.5"
              />
              <path
                d="M6.5 3.5V6.5L8 8"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <input
              type="number"
              placeholder="Preço máx..."
              value={precoMax}
              onChange={(e) => setPrecoMax(e.target.value)}
              style={styles.filtroInput}
            />
          </div>
          {(marca || cidade || precoMax) && (
            <button
              onClick={() => {
                setMarca("");
                setCidade("");
                setPrecoMax("");
              }}
              style={styles.botaoLimpar}
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      <div style={styles.conteudo}>
        {carregando ? (
          <div style={styles.estado}>
            <p style={styles.estadoTexto}>Carregando veículos...</p>
          </div>
        ) : filtrados.length === 0 ? (
          <div style={styles.estado}>
            <p style={styles.estadoTexto}>Nenhum veículo encontrado</p>
            <p style={styles.estadoSub}>Tente ajustar os filtros</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {filtrados.map((veiculo) => (
              <div
                key={veiculo.id}
                style={styles.card}
                onClick={() => navigate(`/veiculo/${veiculo.id}`)}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor =
                    "rgba(255,255,255,0.15)";
                  (e.currentTarget as HTMLDivElement).style.backgroundColor =
                    "#1E1E1E";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor =
                    "rgba(255,255,255,0.08)";
                  (e.currentTarget as HTMLDivElement).style.backgroundColor =
                    "#1A1A1A";
                }}
              >
                <div style={styles.cardHeader}>
                  <div>
                    <p style={styles.cardMarca}>{veiculo.marca}</p>
                    <p style={styles.cardModelo}>{veiculo.modelo}</p>
                  </div>
                  <span style={styles.cardAno}>{veiculo.ano}</span>
                </div>

                <p style={styles.cardPreco}>
                  R$ {veiculo.preco.toLocaleString("pt-BR")}
                </p>

                <div style={styles.cardTags}>
                  <span style={styles.tag}>
                    {veiculo.km.toLocaleString("pt-BR")} km
                  </span>
                  <span style={styles.tag}>{veiculo.cidade}</span>
                </div>

                {veiculo.descricao && (
                  <p style={styles.cardDesc}>{veiculo.descricao}</p>
                )}

                <div style={styles.cardRodape}>
                  <span style={styles.cardRevenda}>
                    {veiculo.revendas.nome}
                  </span>
                  <span style={styles.cardLink}>Ver detalhes →</span>
                </div>
              </div>
            ))}
          </div>
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
    padding: "28px 32px 0",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  headerTopo: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "20px",
  },
  headerEsquerda: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  titulo: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#FFFFFF",
    margin: 0,
  },
  contador: {
    backgroundColor: "rgba(255,255,255,0.08)",
    color: "rgba(255,255,255,0.4)",
    fontSize: "11px",
    padding: "2px 8px",
    borderRadius: "99px",
    fontWeight: "500",
  },
  filtros: {
    display: "flex",
    gap: "8px",
    paddingBottom: "16px",
    flexWrap: "wrap",
    alignItems: "center",
  },
  filtroWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "6px",
    padding: "0 10px",
    height: "32px",
  },
  filtroIcone: {
    flexShrink: 0,
  },
  filtroInput: {
    backgroundColor: "transparent",
    border: "none",
    outline: "none",
    color: "#FFFFFF",
    fontSize: "13px",
    width: "130px",
  },
  botaoLimpar: {
    backgroundColor: "transparent",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "6px",
    color: "rgba(255,255,255,0.35)",
    fontSize: "12px",
    padding: "0 12px",
    height: "32px",
    cursor: "pointer",
  },
  conteudo: {
    padding: "24px 32px",
    flex: 1,
  },
  estado: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "80px 0",
    gap: "8px",
  },
  estadoTexto: {
    color: "rgba(255,255,255,0.4)",
    fontSize: "14px",
    margin: 0,
  },
  estadoSub: {
    color: "rgba(255,255,255,0.2)",
    fontSize: "12px",
    margin: 0,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "12px",
  },
  card: {
    backgroundColor: "#1A1A1A",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "10px",
    padding: "16px",
    cursor: "pointer",
    transition: "border-color 0.15s, background-color 0.15s",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardMarca: {
    fontSize: "11px",
    color: "rgba(255,255,255,0.3)",
    margin: 0,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  cardModelo: {
    fontSize: "15px",
    fontWeight: "500",
    color: "#FFFFFF",
    margin: "2px 0 0",
  },
  cardAno: {
    fontSize: "11px",
    color: "rgba(255,255,255,0.25)",
    backgroundColor: "rgba(255,255,255,0.06)",
    padding: "3px 8px",
    borderRadius: "4px",
  },
  cardPreco: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#4ADE80",
    margin: 0,
  },
  cardTags: {
    display: "flex",
    gap: "6px",
  },
  tag: {
    fontSize: "11px",
    color: "rgba(255,255,255,0.4)",
    backgroundColor: "rgba(255,255,255,0.06)",
    padding: "3px 8px",
    borderRadius: "4px",
  },
  cardDesc: {
    fontSize: "12px",
    color: "rgba(255,255,255,0.3)",
    margin: 0,
    lineHeight: 1.5,
    overflow: "hidden",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
  },
  cardRodape: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: "10px",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    marginTop: "auto",
  },
  cardRevenda: {
    fontSize: "11px",
    color: "rgba(255,255,255,0.25)",
  },
  cardLink: {
    fontSize: "11px",
    color: "#5B6AD0",
    fontWeight: "500",
  },
};
