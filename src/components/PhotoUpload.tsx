// src/components/PhotoUpload.tsx
import { useState } from "react";
import { supabase } from "../lib/supabase";

type Props = {
  veiculoId: string;
  onUploadConcluido: (urls: string[]) => void;
};

export default function PhotoUpload({ veiculoId, onUploadConcluido }: Props) {
  const [fotos, setFotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  function handleSelecionar(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivos = Array.from(e.target.files || []);

    if (arquivos.length + fotos.length > 10) {
      setErro("Máximo de 10 fotos por veículo");
      return;
    }

    const grandes = arquivos.filter((f) => f.size > 5 * 1024 * 1024);
    if (grandes.length > 0) {
      setErro("Cada foto deve ter no máximo 5MB");
      return;
    }

    setErro("");
    setFotos((prev) => [...prev, ...arquivos]);

    arquivos.forEach((arquivo) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPreviews((prev) => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(arquivo);
    });
  }

  function handleRemover(index: number) {
    setFotos((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleEnviar() {
    if (fotos.length === 0) return;

    setEnviando(true);
    setErro("");
    const urls: string[] = [];

    for (let i = 0; i < fotos.length; i++) {
      const foto = fotos[i];
      const ext = foto.name.split(".").pop();
      const caminho = `${veiculoId}/${Date.now()}_${i}.${ext}`;

      const { error } = await supabase.storage
        .from("fotos-veiculos")
        .upload(caminho, foto);

      if (error) {
        setErro("Erro ao enviar foto. Tente novamente.");
        setEnviando(false);
        return;
      }

      const { data } = supabase.storage
        .from("fotos-veiculos")
        .getPublicUrl(caminho);

      urls.push(data.publicUrl);
    }

    for (let i = 0; i < urls.length; i++) {
      await supabase.from("fotos_veiculos").insert({
        veiculo_id: veiculoId,
        url: urls[i],
        ordem: i,
      });
    }

    onUploadConcluido(urls);
    setFotos([]);
    setPreviews([]);
    setEnviando(false);
  }

  return (
    <div style={styles.container}>
      <label style={styles.label}>Fotos do veículo</label>

      <div style={styles.previewGrid}>
        {previews.map((src, i) => (
          <div key={i} style={styles.previewItem}>
            <img src={src} alt={`foto ${i + 1}`} style={styles.previewImg} />
            <button
              type="button"
              onClick={() => handleRemover(i)}
              style={styles.botaoRemover}
            >
              ✕
            </button>
          </div>
        ))}

        {fotos.length < 10 && (
          <label style={styles.addButton}>
            <span style={styles.addIcone}>+</span>
            <span style={styles.addTexto}>Adicionar foto</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleSelecionar}
              style={{ display: "none" }}
            />
          </label>
        )}
      </div>

      {erro && <p style={styles.erro}>{erro}</p>}

      {fotos.length > 0 && (
        <button
          type="button"
          onClick={handleEnviar}
          disabled={enviando}
          style={styles.botaoEnviar}
        >
          {enviando
            ? "Enviando fotos..."
            : `Enviar ${fotos.length} foto${fotos.length > 1 ? "s" : ""}`}
        </button>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "10px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#333",
  },
  previewGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
    gap: "10px",
  },
  previewItem: {
    position: "relative" as const,
    borderRadius: "8px",
    overflow: "hidden",
    aspectRatio: "1",
  },
  previewImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover" as const,
  },
  botaoRemover: {
    position: "absolute" as const,
    top: "4px",
    right: "4px",
    backgroundColor: "rgba(0,0,0,0.6)",
    color: "#fff",
    border: "none",
    borderRadius: "50%",
    width: "22px",
    height: "22px",
    cursor: "pointer",
    fontSize: "11px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  addButton: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    border: "2px dashed #ddd",
    borderRadius: "8px",
    aspectRatio: "1",
    cursor: "pointer",
    gap: "4px",
  },
  addIcone: {
    fontSize: "24px",
    color: "#aaa",
  },
  addTexto: {
    fontSize: "11px",
    color: "#aaa",
  },
  erro: {
    fontSize: "12px",
    color: "#e53e3e",
  },
  botaoEnviar: {
    padding: "10px",
    backgroundColor: "#2d7a3a",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
  },
};
