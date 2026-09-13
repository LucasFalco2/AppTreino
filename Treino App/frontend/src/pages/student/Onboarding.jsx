import { useEffect, useState } from "react";
import api from "../../api/client";
import { useAuth } from "../../api/AuthContext";

export default function Onboarding() {
  const { user } = useAuth();

  const [f, setF] = useState({
    objective: "",
    routine: "",
    nutritionNotes: "",
    allergies: "",
    trainingFrequency: "",
    birthDate: "",
    gender: "",
    heightCm: "",
    weightKg: "",
  });

  const [ok, setOk] = useState(false);

  useEffect(() => {
    api.get("/onboarding/me").then((r) => {
      setF((x) => ({
        ...x,
        birthDate: r.data.birthDate?.slice(0, 10) || "",
        gender: r.data.gender || "",
        heightCm: r.data.heightCm || "",
        weightKg: r.data.currentWeightKg || "",
        objective: r.data.objective || "",
        routine: r.data.routine || "",
        nutritionNotes: r.data.nutritionNotes || "",
        allergies: r.data.allergies || "",
        trainingFrequency: r.data.trainingFrequency || "",
      }));
    });
  }, []);

  async function save(e) {
    e.preventDefault();

    await api.post("/onboarding", {
      ...f,
      heightCm: f.heightCm ? Number(f.heightCm) : undefined,
      weightKg: f.weightKg ? Number(f.weightKg) : undefined,
      trainingFrequency: f.trainingFrequency
        ? Number(f.trainingFrequency)
        : undefined,
    });

    setOk(true);
  }

  function updateField(field, value) {
    setF((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-2">
        Seu cadastro inicial
      </h1>

      <p className="text-muted mb-6">
        Preencha estas informações para o Lucas montar seu treino e,
        quando aplicável, sua alimentação.
      </p>

      <form
        onSubmit={save}
        className="grid sm:grid-cols-2 gap-3"
      >
        <input
          type="date"
          value={f.birthDate}
          onChange={(e) =>
            updateField("birthDate", e.target.value)
          }
          className="field"
        />

        <select
          value={f.gender}
          onChange={(e) =>
            updateField("gender", e.target.value)
          }
          className="field"
        >
          <option value="">Gênero</option>
          <option value="Masculino">Masculino</option>
          <option value="Feminino">Feminino</option>
          <option value="Outro">Outro</option>
        </select>

        <input
          placeholder="Altura (cm)"
          type="number"
          value={f.heightCm}
          onChange={(e) =>
            updateField("heightCm", e.target.value)
          }
          className="field"
        />

        <input
          placeholder="Peso atual (kg)"
          type="number"
          step="0.1"
          value={f.weightKg}
          onChange={(e) =>
            updateField("weightKg", e.target.value)
          }
          className="field"
        />

        <input
          placeholder="Quantos dias por semana pretende treinar?"
          type="number"
          min="1"
          max="7"
          value={f.trainingFrequency}
          onChange={(e) =>
            updateField("trainingFrequency", e.target.value)
          }
          className="field"
        />

        <textarea
          required
          placeholder="Objetivo (ex.: emagrecimento, hipertrofia, desempenho)"
          value={f.objective}
          onChange={(e) =>
            updateField("objective", e.target.value)
          }
          className="field"
        />

        <textarea
          required
          className="field sm:col-span-2"
          placeholder="Rotina: horários, trabalho/estudo, tempo disponível, sono..."
          value={f.routine}
          onChange={(e) =>
            updateField("routine", e.target.value)
          }
        />

        <textarea
          className="field sm:col-span-2"
          placeholder="Alimentação atual, preferências e dificuldades"
          value={f.nutritionNotes}
          onChange={(e) =>
            updateField("nutritionNotes", e.target.value)
          }
        />

        <textarea
          className="field sm:col-span-2"
          placeholder="Alergias, restrições ou observações importantes"
          value={f.allergies}
          onChange={(e) =>
            updateField("allergies", e.target.value)
          }
        />

        <button
          type="submit"
          className="sm:col-span-2 bg-accent text-ink font-semibold rounded-lg py-3"
        >
          Salvar cadastro
        </button>
      </form>

      {ok && (
        <p className="text-accent mt-4">
          Cadastro salvo!
        </p>
      )}
    </div>
  );
}