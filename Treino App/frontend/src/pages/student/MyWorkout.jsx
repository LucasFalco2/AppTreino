import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { mediaUrl } from "../../api/client";
import { useAuth } from "../../api/AuthContext";

const DAYS = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

export default function MyWorkout() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [w, setW] = useState(null);
  const [day, setDay] = useState(new Date().getDay());
  const [streak, setStreak] = useState(0);
  const [open, setOpen] = useState(null);

  const [form, setForm] = useState({
    loadKg: "",
    reps: "",
    note: "",
  });

  const [error, setError] = useState("");

  async function load() {
    if (!user?.studentId) return;

    try {
      const [wr, ar] = await Promise.all([
        api.get(
          `/workouts/students/${user.studentId}/workout`
        ),
        api.get("/attendance/me"),
      ]);

      setW(wr.data);
      setStreak(ar.data.streak || 0);

      if (
        wr.data?.days?.length &&
        !wr.data.days.some(
          (d) => d.weekday === Number(day)
        )
      ) {
        setDay(wr.data.days[0].weekday);
      }
    } catch (e) {
      setError(
        e.response?.data?.error ||
          "Não foi possível carregar seu treino."
      );
    }
  }

  useEffect(() => {
    load();
  }, [user]);

  const selected = useMemo(
    () =>
      w?.days?.find(
        (d) => d.weekday === Number(day)
      ),
    [w, day]
  );

  async function log(id) {
    try {
      await api.post("/workouts/workout-logs", {
        studentId: user.studentId,
        workoutExerciseId: id,
        loadKg: Number(form.loadKg),
        reps: Number(form.reps),
        note: form.note || undefined,
      });

      setOpen(null);

      setForm({
        loadKg: "",
        reps: "",
        note: "",
      });

      /*
       * Recarrega o treino para buscar a nova
       * última carga registrada.
       */
      await load();
    } catch (e) {
      setError(
        e.response?.data?.error ||
          "Não foi possível registrar a carga."
      );
    }
  }

  async function complete(id) {
    try {
      await api.post(
        "/workouts/exercise-completions",
        {
          studentId: user.studentId,
          workoutExerciseId: id,
        }
      );

      await load();
    } catch (e) {
      setError(
        e.response?.data?.error ||
          "Não foi possível marcar o exercício como concluído."
      );
    }
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-3">
          Meu treino
        </h1>

        <p className="text-red-400 bg-red-400/10 p-3 rounded-lg">
          {error}
        </p>
      </div>
    );
  }

  if (!w) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-3">
          Meu treino
        </h1>

        <p className="text-muted">
          Você ainda não tem um treino ativo.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-5">
        <div>
          <h1 className="text-2xl font-bold">
            {w.title}
          </h1>

          <p className="text-accent text-sm mt-1">
            🔥 {streak} dias de sequência
          </p>
        </div>

        <select
          value={day}
          onChange={(e) => setDay(e.target.value)}
          className="field max-w-sm"
        >
          {w.days.map((d) => (
            <option
              key={d.id}
              value={d.weekday}
            >
              {DAYS[d.weekday]} — {d.title}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-5 flex items-center justify-between">
        <p className="text-muted text-sm">
          Selecione o dia e siga os exercícios na ordem.
        </p>

        <button
          onClick={() => navigate("/app/checkin")}
          className="border border-white/20 rounded-lg px-4 py-2 text-sm"
        >
          Check-in
        </button>
      </div>

      {!selected ? (
        <div className="card">
          <p className="font-semibold">
            Descanso
          </p>

          <p className="text-muted text-sm mt-1">
            Não há treino cadastrado para este dia.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {selected.exercises.map((we, i) => {
            const done = !!we.completions?.length;

            return (
              <article
                key={we.id}
                className={`card ${
                  done ? "opacity-70" : ""
                }`}
              >
                <div className="grid lg:grid-cols-[minmax(220px,360px)_1fr] gap-5 items-start">
                  <div>
                    {we.exercise.videos?.[0] ? (
                      <video
                        controls
                        playsInline
                        preload="metadata"
                        className="w-full max-h-64 rounded-xl bg-black object-contain"
                        src={mediaUrl(
                          we.exercise.videos[0].url
                        )}
                      />
                    ) : (
                      <div className="w-full h-48 rounded-xl bg-white/5 flex items-center justify-center text-muted text-sm">
                        Vídeo ainda não cadastrado
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold">
                          {i + 1}. {we.exercise.name}
                        </p>

                        <p className="text-muted text-sm mt-2">
                          {we.sets} séries ·{" "}
                          {we.reps} repetições ·{" "}
                          {we.restSeconds}s de descanso
                        </p>
                      </div>

                      {done && (
                        <span className="text-accent text-sm font-semibold">
                          ✓ Concluído
                        </span>
                      )}
                    </div>

                    {we.coachNote && (
                      <p className="text-sm mt-3 border-l-2 border-accent pl-3">
                        {we.coachNote}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 mt-5 items-center">
                      <button
                        disabled={done}
                        onClick={() =>
                          complete(we.id)
                        }
                        className={`rounded-lg px-4 py-2 font-semibold text-sm ${
                          done
                            ? "bg-white/10 text-muted"
                            : "bg-accent text-ink"
                        }`}
                      >
                        {done
                          ? "Exercício concluído"
                          : "✓ Marcar como feito"}
                      </button>

                      <button
                        onClick={() =>
                          setOpen(
                            open === we.id
                              ? null
                              : we.id
                          )
                        }
                        className="border border-white/20 rounded-lg px-4 py-2 text-sm"
                      >
                        Registrar carga
                      </button>

                      <div className="text-sm text-muted px-2">
                        <span>
                          Última carga registrada:{" "}
                        </span>

                        <span className="font-semibold text-white">
                          {we.lastLoad
                            ? `${we.lastLoad.loadKg} kg × ${we.lastLoad.reps} reps`
                            : "Nenhuma"}
                        </span>
                      </div>
                    </div>

                    {open === we.id && (
                      <div className="grid sm:grid-cols-3 gap-2 mt-3">
                        <input
                          className="field"
                          type="number"
                          step=".5"
                          placeholder="Carga (kg)"
                          value={form.loadKg}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              loadKg: e.target.value,
                            })
                          }
                        />

                        <input
                          className="field"
                          type="number"
                          placeholder="Repetições"
                          value={form.reps}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              reps: e.target.value,
                            })
                          }
                        />

                        <button
                          onClick={() =>
                            log(we.id)
                          }
                          className="bg-accent text-ink rounded-lg font-semibold"
                        >
                          Salvar carga
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}