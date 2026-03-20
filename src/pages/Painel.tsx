// src/pages/Painel.tsx
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import PhotoUpload from "../components/PhotoUpload";

type Veiculo = {
  id: string;
  marca: string;
  modelo: string;
  ano: number;
  preco: number;
  km: number;
  cidade: string;
  descricao: string;
  status: string;
  created_at: string;
};

const schema = z.object({
  marca: z.string().min(2, "Informe a marca"),
  modelo: z.string().min(2, "Informe o modelo"),
  ano: z.string().min(4, "Informe o ano"),
  preco: z.string().min(1, "Informe o preço"),
  km: z.string().min(1, "Informe a quilometragem"),
  cidade: z.string().min(2, "Informe a cidade"),
  descricao: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function Painel() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [veiculoIdCriado, setVeiculoIdCriado] = useState<string | null>(null);
  const { usuario } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (usuario?.revenda_id) buscarVeiculos();
  }, [usuario]);

  async function buscarVeiculos() {
    const { data } = await supabase
      .from("veiculos")
      .select("*")
      .eq("revenda_id", usuario?.revenda_id)
      .order("created_at", { ascending: false });
    setVeiculos(data || []);
    setCarregando(false);
  }

  async function onSubmit(data: FormData) {
    setSalvando(true);
    setErro("");

    const { data: veiculoCriado, error } = await supabase
      .from("veiculos")
      .insert({
        revenda_id: usuario?.revenda_id,
        marca: data.marca,
        modelo: data.modelo,
        ano: parseInt(data.ano),
        preco: parseFloat(data.preco),
        km: parseInt(data.km),
        cidade: data.cidade,
        descricao: data.descricao || "",
        status: "ativo",
      })
      .select()
      .single();

    if (error || !veiculoCriado) {
      setErro("Erro ao cadastrar veículo. Tente novamente.");
      setSalvando(false);
      return;
    }

    setVeiculoIdCriado(veiculoCriado.id);
    reset();
    setSalvando(false);
  }

  async function encerrarAnuncio(id: string) {
    await supabase.from("veiculos").update({ status: "vendido" }).eq("id", id);
    setVeiculos((prev) => prev.filter((v) => v.id !== id));
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerEsquerda}>
          <h1 style={styles.titulo}>Meus anúncios</h1>
          <span style={styles.contador}>{veiculos.length}</span>
        </div>
        <button
          onClick={() => {
            setMostrarForm(true);
            setVeiculoIdCriado(null);
          }}
          style={styles.botaoNovo}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M7 1V13M1 7H13"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          Novo anúncio
        </button>
      </div>

      {mostrarForm && (
        <div style={styles.modal}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitulo}>
                {veiculoIdCriado ? "Adicionar fotos" : "Novo anúncio"}
              </h2>
              <button
                onClick={() => {
                  setMostrarForm(false);
                  setVeiculoIdCriado(null);
                  reset();
                }}
                style={styles.modalFechar}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M3 3L13 13M13 3L3 13"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            {!veiculoIdCriado ? (
              <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
                <div style={styles.grid2}>
                  <div style={styles.campo}>
                    <label style={styles.label}>Marca</label>
                    <input
                      {...register("marca")}
                      placeholder="Ex: Toyota"
                      style={styles.input}
                    />
                    {errors.marca && (
                      <span style={styles.erroMsg}>{errors.marca.message}</span>
                    )}
                  </div>
                  <div style={styles.campo}>
                    <label style={styles.label}>Modelo</label>
                    <input
                      {...register("modelo")}
                      placeholder="Ex: Corolla"
                      style={styles.input}
                    />
                    {errors.modelo && (
                      <span style={styles.erroMsg}>
                        {errors.modelo.message}
                      </span>
                    )}
                  </div>
                </div>

                <div style={styles.grid3}>
                  <div style={styles.campo}>
                    <label style={styles.label}>Ano</label>
                    <input
                      {...register("ano")}
                      placeholder="2020"
                      style={styles.input}
                    />
                    {errors.ano && (
                      <span style={styles.erroMsg}>{errors.ano.message}</span>
                    )}
                  </div>
                  <div style={styles.campo}>
                    <label style={styles.label}>Preço (R$)</label>
                    <input
                      {...register("preco")}
                      placeholder="85000"
                      style={styles.input}
                    />
                    {errors.preco && (
                      <span style={styles.erroMsg}>{errors.preco.message}</span>
                    )}
                  </div>
                  <div style={styles.campo}>
                    <label style={styles.label}>Quilometragem</label>
                    <input
                      {...register("km")}
                      placeholder="45000"
                      style={styles.input}
                    />
                    {errors.km && (
                      <span style={styles.erroMsg}>{errors.km.message}</span>
                    )}
                  </div>
                </div>

                <div style={styles.campo}>
                  <label style={styles.label}>Cidade</label>
                  <input
                    {...register("cidade")}
                    placeholder="Ex: Florianópolis"
                    style={styles.input}
                  />
                  {errors.cidade && (
                    <span style={styles.erroMsg}>{errors.cidade.message}</span>
                  )}
                </div>

                <div style={styles.campo}>
                  <label style={styles.label}>
                    Descrição{" "}
                    <span style={styles.labelOpcional}>(opcional)</span>
                  </label>
                  <textarea
                    {...register("descricao")}
                    placeholder="Detalhes adicionais..."
                    style={styles.textarea}
                    rows={3}
                  />
                </div>

                {erro && <p style={styles.erroGeral}>{erro}</p>}

                <div style={styles.formBotoes}>
                  <button
                    type="button"
                    onClick={() => {
                      setMostrarForm(false);
                      reset();
                    }}
                    style={styles.botaoCancelar}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={salvando}
                    style={styles.botaoSalvar}
                  >
                    {salvando ? "Salvando..." : "Publicar anúncio"}
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <PhotoUpload
                  veiculoId={veiculoIdCriado}
                  onUploadConcluido={() => {
                    setVeiculoIdCriado(null);
                    setMostrarForm(false);
                    buscarVeiculos();
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setVeiculoIdCriado(null);
                    setMostrarForm(false);
                    buscarVeiculos();
                  }}
                  style={{
                    ...styles.botaoCancelar,
                    marginTop: "12px",
                    width: "100%",
                  }}
                >
                  Pular — adicionar fotos depois
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div style={styles.conteudo}>
        {carregando ? (
          <div style={styles.estado}>
            <p style={styles.estadoTexto}>Carregando...</p>
          </div>
        ) : veiculos.length === 0 ? (
          <div style={styles.estado}>
            <p style={styles.estadoTexto}>Nenhum anúncio ainda</p>
            <p style={styles.estadoSub}>
              Clique em "Novo anúncio" para começar
            </p>
          </div>
        ) : (
          <div style={styles.lista}>
            {veiculos.map((veiculo, i) => (
              <div
                key={veiculo.id}
                style={{
                  ...styles.item,
                  ...(i === 0
                    ? {}
                    : { borderTop: "1px solid rgba(255,255,255,0.06)" }),
                }}
              >
                <div style={styles.itemEsquerda}>
                  <div style={styles.itemInfo}>
                    <p style={styles.itemMarca}>{veiculo.marca}</p>
                    <p style={styles.itemModelo}>
                      {veiculo.modelo}{" "}
                      <span style={styles.itemAno}>{veiculo.ano}</span>
                    </p>
                  </div>
                  <div style={styles.itemTags}>
                    <span style={styles.tag}>
                      {veiculo.km.toLocaleString("pt-BR")} km
                    </span>
                    <span style={styles.tag}>{veiculo.cidade}</span>
                    <span style={styles.tagAtivo}>Ativo</span>
                  </div>
                </div>

                <div style={styles.itemDireita}>
                  <p style={styles.itemPreco}>
                    R$ {veiculo.preco.toLocaleString("pt-BR")}
                  </p>
                  <p style={styles.itemData}>
                    {new Date(veiculo.created_at).toLocaleDateString("pt-BR")}
                  </p>
                  <button
                    onClick={() => encerrarAnuncio(veiculo.id)}
                    style={styles.botaoEncerrar}
                  >
                    Encerrar
                  </button>
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
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "28px 32px 20px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
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
  },
  botaoNovo: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "#5B6AD0",
    color: "#fff",
    border: "none",
    padding: "7px 14px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
  },
  modal: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
    padding: "20px",
  },
  modalCard: {
    backgroundColor: "#1A1A1A",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px",
    padding: "24px",
    width: "100%",
    maxWidth: "520px",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  modalTitulo: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#FFFFFF",
    margin: 0,
  },
  modalFechar: {
    backgroundColor: "transparent",
    border: "none",
    color: "rgba(255,255,255,0.3)",
    cursor: "pointer",
    padding: "4px",
    display: "flex",
    alignItems: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  grid3: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
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
  labelOpcional: {
    color: "rgba(255,255,255,0.25)",
    fontWeight: "400",
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "6px",
    padding: "8px 12px",
    color: "#FFFFFF",
    fontSize: "13px",
    outline: "none",
  },
  textarea: {
    backgroundColor: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "6px",
    padding: "8px 12px",
    color: "#FFFFFF",
    fontSize: "13px",
    outline: "none",
    resize: "vertical",
    fontFamily: "inherit",
  },
  erroMsg: {
    fontSize: "11px",
    color: "#F87171",
  },
  erroGeral: {
    fontSize: "12px",
    color: "#F87171",
    backgroundColor: "rgba(248,113,113,0.1)",
    padding: "8px 12px",
    borderRadius: "6px",
    margin: 0,
  },
  formBotoes: {
    display: "flex",
    gap: "8px",
    justifyContent: "flex-end",
    paddingTop: "4px",
  },
  botaoCancelar: {
    backgroundColor: "transparent",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "6px",
    color: "rgba(255,255,255,0.4)",
    fontSize: "13px",
    padding: "8px 16px",
    cursor: "pointer",
  },
  botaoSalvar: {
    backgroundColor: "#5B6AD0",
    border: "none",
    borderRadius: "6px",
    color: "#fff",
    fontSize: "13px",
    fontWeight: "500",
    padding: "8px 16px",
    cursor: "pointer",
  },
  conteudo: {
    flex: 1,
    padding: "0 32px",
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
  lista: {
    display: "flex",
    flexDirection: "column",
  },
  item: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 0",
    gap: "16px",
  },
  itemEsquerda: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    flex: 1,
  },
  itemInfo: {
    display: "flex",
    alignItems: "baseline",
    gap: "8px",
  },
  itemMarca: {
    fontSize: "10px",
    color: "rgba(255,255,255,0.25)",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    margin: 0,
  },
  itemModelo: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#FFFFFF",
    margin: 0,
  },
  itemAno: {
    fontSize: "12px",
    color: "rgba(255,255,255,0.3)",
    fontWeight: "400",
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
  tagAtivo: {
    fontSize: "11px",
    color: "#4ADE80",
    backgroundColor: "rgba(74,222,128,0.1)",
    padding: "3px 8px",
    borderRadius: "4px",
  },
  itemDireita: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    flexShrink: 0,
  },
  itemPreco: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#4ADE80",
    margin: 0,
  },
  itemData: {
    fontSize: "11px",
    color: "rgba(255,255,255,0.25)",
    margin: 0,
  },
  botaoEncerrar: {
    backgroundColor: "transparent",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "6px",
    color: "rgba(255,255,255,0.3)",
    fontSize: "12px",
    padding: "5px 12px",
    cursor: "pointer",
  },
};
