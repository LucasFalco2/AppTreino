export default function PlanCard({ plan, featured, onSelect }) {
  return (
    <div
      className={`relative rounded-2xl p-6 border ${
        featured ? "border-accent bg-white/5" : "border-white/10 bg-surface"
      }`}
    >
      {featured && (
        <span className="absolute -top-3 left-6 bg-accent text-ink text-xs font-bold px-3 py-1 rounded-full">
          MAIS COMPLETO
        </span>
      )}

      <h3 className="text-lg font-semibold">{plan.name}</h3>
      <p className="text-3xl font-bold mt-2">
        R$ {(plan.priceCents / 100).toFixed(2).replace(".", ",")}
        <span className="text-sm text-muted font-normal">/mês</span>
      </p>
      <p className="text-muted text-sm mt-2">{plan.description}</p>

      <ul className="mt-4 space-y-2 text-sm">
        {plan.hasTraining && <li>✔ Treino personalizado + vídeos</li>}
        {plan.hasTracking && <li>✔ Acompanhamento e ajustes</li>}
        {plan.hasCheckin && <li>✔ Check-in periódico</li>}
        {plan.hasNutrition && <li>✔ Área alimentar completa</li>}
      </ul>

      <button
        onClick={() => onSelect?.(plan)}
        className={`mt-6 w-full rounded-full py-3 font-semibold transition ${
          featured
            ? "bg-accent text-ink hover:bg-accentDark"
            : "bg-white/10 hover:bg-white/20"
        }`}
      >
        Escolher plano
      </button>
    </div>
  );
}
