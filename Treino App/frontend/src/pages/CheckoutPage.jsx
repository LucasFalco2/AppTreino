import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/client";

const WA = "5541998996206";

export default function CheckoutPage() {
  const { state } = useLocation();
  const nav = useNavigate();

  const plan = state?.plan;

  const [f, setF] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    couponCode: "",
  });

  const [pay, setPay] = useState(null);
  const [err, setErr] = useState("");

  if (!plan) {
    return (
      <div className="p-8">
        <p>Nenhum plano selecionado.</p>

        <button
          onClick={() => nav("/#planos")}
          className="mt-4 underline"
        >
          Voltar
        </button>
      </div>
    );
  }

  async function submit(e) {
    e.preventDefault();
    setErr("");

    try {
      const r = await api.post("/payments", {
        ...f,
        planId: plan.id,
      });

      setPay(r.data);
    } catch (e) {
      setErr(
        e.response?.data?.error ||
          "Não foi possível criar a cobrança."
      );
    }
  }

  const msg = pay
    ? `Olá, Lucas! Acabei de escolher o plano ${pay.plan}. Nome: ${
        f.name
      }. Valor: R$ ${(pay.amountCents / 100)
        .toFixed(2)
        .replace(".", ",")}. Estou enviando o comprovante do PIX para liberar meu acesso.`
    : "";

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-2">
        Finalizar: {plan.name}
      </h1>

      <p className="text-muted mb-6">
        R$ {(plan.priceCents / 100)
          .toFixed(2)
          .replace(".", ",")}
        /mês
      </p>

      {!pay ? (
        <form
          onSubmit={submit}
          className="space-y-3 bg-surface border border-white/10 rounded-2xl p-6"
        >
          {["name", "email", "phone", "password"].map((k) => (
            <input
              key={k}
              required={k !== "phone"}
              type={k === "password" ? "password" : "text"}
              placeholder={
                {
                  name: "Nome completo",
                  email: "E-mail",
                  phone: "WhatsApp",
                  password: "Senha de acesso",
                }[k]
              }
              value={f[k]}
              onChange={(e) =>
                setF({
                  ...f,
                  [k]: e.target.value,
                })
              }
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-3"
            />
          ))}

          <input
            placeholder="Cupom (opcional)"
            value={f.couponCode}
            onChange={(e) =>
              setF({
                ...f,
                couponCode: e.target.value.toUpperCase(),
              })
            }
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-3"
          />

          <button className="w-full bg-accent text-ink font-semibold rounded-lg py-3">
            Gerar PIX e continuar
          </button>

          {err && (
            <p className="text-red-400 text-sm">
              {err}
            </p>
          )}
        </form>
      ) : (
        <div className="bg-surface border border-white/10 rounded-2xl p-6 text-center">
          <h2 className="text-xl font-semibold">
            PIX gerado
          </h2>

          <p className="text-muted mt-2">
            Valor: R${" "}
            {(pay.amountCents / 100)
              .toFixed(2)
              .replace(".", ",")}
          </p>

          <div className="my-6 space-y-3 text-left">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-xs text-muted">Chave PIX</p>
              <p className="font-mono text-lg font-semibold break-all">
                {pay.pixKeyDisplay || pay.pixKey || "111.511.019-58"}
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-xs text-muted">Nome</p>
              <p className="font-semibold">{pay.pixName || "Lucas Falco"}</p>
            </div>
            {pay.amountCents > 0 ? (
              <p className="text-sm text-muted">
                Faça o PIX no valor informado e envie o comprovante pelo WhatsApp.
              </p>
            ) : (
              <p className="text-accent font-semibold">Cupom de 100% aplicado. Não há valor a pagar.</p>
            )}
          </div>

          <a
            target="_blank"
            rel="noreferrer"
            href={`https://wa.me/${WA}?text=${encodeURIComponent(
              msg
            )}`}
            className="block bg-accent text-ink font-semibold rounded-lg py-3"
          >
            Enviar comprovante pelo WhatsApp
          </a>

          <p className="text-xs text-muted mt-4">
            Depois de conferir o comprovante, Lucas libera seu
            acesso manualmente. Você receberá os dados de acesso
            por esta página/WhatsApp.
          </p>
        </div>
      )}
    </div>
  );
}