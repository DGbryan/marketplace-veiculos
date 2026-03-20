// src/pages/Detalhe.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

type Foto = {
  id: string;
  url: string;
  ordem: number;
};

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
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [fotoAtiva, setFotoAtiva] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) buscarVeiculo();
  }, [id]);

  async function buscarVeiculo() {
    const [{ data: veiculoData }, { data: fotosData }] = await Promise.all([
      supabase
        .from("veiculos")
        .select("*, revendas(nome, telefone, cidade, email)")
        .eq("id", id)
        .single(),
      supabase
        .from("fotos_veiculos")
        .select("*")
        .eq("veiculo_id", id)
        .order("ordem", { ascending: true }),
    ]);
    setVeiculo(veiculoData);
    setFotos(fotosData || []);
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
        <p style={styles.loadingTexto}>Carregando...</p>
      </div>
    );
  }

  if (!veiculo) {
    return (
      <div style={styles.loading}>
        <p style={styles.loadingTexto}>Veículo não encontrado.</p>
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
      {/* Topbar */}
      <div style={styles.topbar}>
        <button
          onClick={() => navigate("/catalogo")}
          style={styles.botaoVoltar}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M9 2L4 7L9 12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Voltar
        </button>
        <div style={styles.breadcrumb}>
          <span style={styles.breadcrumbItem}>{veiculo.marca}</span>
          <span style={styles.breadcrumbSep}>/</span>
          <span style={styles.breadcrumbItem}>{veiculo.modelo}</span>
          <span style={styles.breadcrumbSep}>/</span>
          <span style={styles.breadcrumbItem}>{veiculo.ano}</span>
        </div>
      </div>

      {/* Layout principal */}
      <div style={styles.layout}>
        {/* Coluna esquerda — galeria */}
        <div style={styles.colFotos}>
          {fotos.length > 0 ? (
            <div style={styles.galeria}>
              {/* Foto principal com setas */}
              <div style={styles.fotoGrandeWrap}>
                <img
                  src={fotos[fotoAtiva].url}
                  alt={`${veiculo.marca} ${veiculo.modelo}`}
                  style={styles.fotoGrande}
                />

                {fotos.length > 1 && (
                  <>
                    <button
                      onClick={() => setFotoAtiva((p) => Math.max(0, p - 1))}
                      disabled={fotoAtiva === 0}
                      style={{
                        ...styles.seta,
                        left: "16px",
                        opacity: fotoAtiva === 0 ? 0.3 : 1,
                      }}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        fill="none"
                      >
                        <path
                          d="M11 4L6 9L11 14"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() =>
                        setFotoAtiva((p) => Math.min(fotos.length - 1, p + 1))
                      }
                      disabled={fotoAtiva === fotos.length - 1}
                      style={{
                        ...styles.seta,
                        right: "16px",
                        opacity: fotoAtiva === fotos.length - 1 ? 0.3 : 1,
                      }}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        fill="none"
                      >
                        <path
                          d="M7 4L12 9L7 14"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </>
                )}

                <div style={styles.contador}>
                  {fotoAtiva + 1} / {fotos.length}
                </div>
              </div>

              {/* Miniaturas embaixo */}
              {fotos.length > 1 && (
                <div style={styles.miniaturas}>
                  {fotos.map((foto, i) => (
                    <div
                      key={foto.id}
                      onClick={() => setFotoAtiva(i)}
                      style={{
                        ...styles.miniaturaWrap,
                        ...(i === fotoAtiva ? styles.miniaturaWrapAtiva : {}),
                      }}
                    >
                      <img
                        src={foto.url}
                        alt={`foto ${i + 1}`}
                        style={styles.miniatura}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={styles.semFoto}>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <rect
                  x="4"
                  y="10"
                  width="40"
                  height="28"
                  rx="4"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="2"
                />
                <circle
                  cx="16"
                  cy="20"
                  r="4"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="2"
                />
                <path
                  d="M4 34L14 24L22 32L31 22L44 34"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
              <p style={styles.semFotoTexto}>Sem fotos disponíveis</p>
            </div>
          )}
        </div>

        {/* Coluna direita — informações */}
        <div style={styles.colInfo}>
          <div style={styles.infoTopo}>
            <div>
              <p style={styles.infoMarca}>{veiculo.marca}</p>
              <h1 style={styles.infoModelo}>{veiculo.modelo}</h1>
            </div>
            <span style={styles.infoAno}>{veiculo.ano}</span>
          </div>

          <div style={styles.precoBadge}>
            <p style={styles.precoLabel}>Preço de atacado</p>
            <p style={styles.precoValor}>
              R$ {veiculo.preco.toLocaleString("pt-BR")}
            </p>
          </div>

          <div style={styles.specsGrid}>
            <div style={styles.specItem}>
              <p style={styles.specLabel}>Quilometragem</p>
              <p style={styles.specValor}>
                {veiculo.km.toLocaleString("pt-BR")} km
              </p>
            </div>
            <div style={styles.specItem}>
              <p style={styles.specLabel}>Cidade</p>
              <p style={styles.specValor}>{veiculo.cidade}</p>
            </div>
            <div style={styles.specItem}>
              <p style={styles.specLabel}>Anunciado em</p>
              <p style={styles.specValor}>
                {new Date(veiculo.created_at).toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>

          {veiculo.descricao && (
            <div style={styles.descricaoBox}>
              <p style={styles.descricaoLabel}>Sobre o veículo</p>
              <p style={styles.descricaoTexto}>{veiculo.descricao}</p>
            </div>
          )}

          <div style={styles.divider} />

          <div style={styles.revendaBox}>
            <div style={styles.revendaAvatar}>
              {veiculo.revendas.nome.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p style={styles.revendaLabel}>Anunciado por</p>
              <p style={styles.revendaNome}>{veiculo.revendas.nome}</p>
              <p style={styles.revendaCidade}>{veiculo.revendas.cidade}</p>
            </div>
          </div>

          <button onClick={abrirWhatsApp} style={styles.botaoWhatsApp}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Entrar em contato via WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  loading: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "16px",
    backgroundColor: "#0F0F0F",
  },
  loadingTexto: {
    color: "rgba(255,255,255,0.4)",
    fontSize: "14px",
    margin: 0,
  },
  container: {
    minHeight: "100vh",
    backgroundColor: "#0F0F0F",
    display: "flex",
    flexDirection: "column",
  },
  topbar: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "16px 24px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  botaoVoltar: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "transparent",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "6px",
    color: "rgba(255,255,255,0.4)",
    fontSize: "12px",
    padding: "6px 12px",
    cursor: "pointer",
    flexShrink: 0,
  },
  breadcrumb: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  breadcrumbItem: {
    fontSize: "12px",
    color: "rgba(255,255,255,0.35)",
  },
  breadcrumbSep: {
    color: "rgba(255,255,255,0.15)",
    fontSize: "12px",
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "1fr 360px",
    flex: 1,
    minHeight: "calc(100vh - 57px)",
  },
  colFotos: {
    padding: "24px",
    borderRight: "1px solid rgba(255,255,255,0.06)",
    display: "flex",
    alignItems: "flex-start",
  },
  galeria: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  fotoGrandeWrap: {
    position: "relative",
    width: "100%",
    backgroundColor: "#141414",
    borderRadius: "10px",
    overflow: "hidden",
    aspectRatio: "16/9",
  },
  fotoGrande: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    display: "block",
  },
  seta: {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    backgroundColor: "rgba(0,0,0,0.65)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "8px",
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "opacity 0.15s",
  },
  contador: {
    position: "absolute",
    bottom: "12px",
    right: "12px",
    backgroundColor: "rgba(0,0,0,0.6)",
    color: "rgba(255,255,255,0.5)",
    fontSize: "11px",
    padding: "4px 10px",
    borderRadius: "99px",
  },
  miniaturas: {
    display: "flex",
    flexDirection: "row",
    gap: "8px",
    overflowX: "auto",
    paddingBottom: "4px",
  },
  miniaturaWrap: {
    flexShrink: 0,
    width: "90px",
    height: "68px",
    borderRadius: "6px",
    overflow: "hidden",
    border: "2px solid transparent",
    cursor: "pointer",
    opacity: 0.5,
    transition: "opacity 0.15s, border-color 0.15s",
  },
  miniaturaWrapAtiva: {
    border: "2px solid #5B6AD0",
    opacity: 1,
  },
  miniatura: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  semFoto: {
    width: "100%",
    aspectRatio: "16/9",
    backgroundColor: "#1A1A1A",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "10px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
  },
  semFotoTexto: {
    color: "rgba(255,255,255,0.2)",
    fontSize: "13px",
    margin: 0,
  },
  colInfo: {
    padding: "28px 24px",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    overflowY: "auto",
    height: "calc(100vh - 57px)",
  },
  infoTopo: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  infoMarca: {
    fontSize: "10px",
    color: "rgba(255,255,255,0.25)",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    margin: "0 0 4px",
  },
  infoModelo: {
    fontSize: "22px",
    fontWeight: "600",
    color: "#FFFFFF",
    margin: 0,
    lineHeight: 1.2,
  },
  infoAno: {
    fontSize: "12px",
    color: "rgba(255,255,255,0.3)",
    backgroundColor: "rgba(255,255,255,0.06)",
    padding: "4px 10px",
    borderRadius: "4px",
    flexShrink: 0,
  },
  precoBadge: {
    backgroundColor: "rgba(74,222,128,0.08)",
    border: "1px solid rgba(74,222,128,0.2)",
    borderRadius: "8px",
    padding: "14px 16px",
  },
  precoLabel: {
    fontSize: "10px",
    color: "rgba(74,222,128,0.6)",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    margin: "0 0 4px",
  },
  precoValor: {
    fontSize: "26px",
    fontWeight: "700",
    color: "#4ADE80",
    margin: 0,
    lineHeight: 1,
  },
  specsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    backgroundColor: "#1A1A1A",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "8px",
    padding: "14px",
  },
  specItem: {
    display: "flex",
    flexDirection: "column",
    gap: "3px",
  },
  specLabel: {
    fontSize: "10px",
    color: "rgba(255,255,255,0.25)",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    margin: 0,
  },
  specValor: {
    fontSize: "13px",
    fontWeight: "500",
    color: "rgba(255,255,255,0.7)",
    margin: 0,
  },
  descricaoBox: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  descricaoLabel: {
    fontSize: "10px",
    color: "rgba(255,255,255,0.25)",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    margin: 0,
  },
  descricaoTexto: {
    fontSize: "13px",
    color: "rgba(255,255,255,0.45)",
    lineHeight: 1.6,
    margin: 0,
  },
  divider: {
    height: "1px",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  revendaBox: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  revendaAvatar: {
    width: "38px",
    height: "38px",
    borderRadius: "8px",
    backgroundColor: "#5B6AD0",
    color: "#fff",
    fontSize: "13px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  revendaLabel: {
    fontSize: "10px",
    color: "rgba(255,255,255,0.25)",
    margin: "0 0 2px",
  },
  revendaNome: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#FFFFFF",
    margin: "0 0 2px",
  },
  revendaCidade: {
    fontSize: "11px",
    color: "rgba(255,255,255,0.3)",
    margin: 0,
  },
  botaoWhatsApp: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    backgroundColor: "#25D366",
    color: "#fff",
    border: "none",
    padding: "13px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    width: "100%",
    marginTop: "auto",
  },
};
