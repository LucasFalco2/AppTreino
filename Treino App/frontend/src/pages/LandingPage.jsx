import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";
import PlanCard from "../components/PlanCard";
import WhatsAppButton from "../components/WhatsAppButton";

const FEATURES = [
  { title: "Treinos personalizados", desc: "Treinos criados de acordo com objetivo, nível e necessidades do aluno." },
  { title: "Acompanhamento", desc: "Acompanhe peso, medidas, cargas e fotos ao longo do tempo." },
  { title: "Execução dos exercícios", desc: "Cada exercício com vídeo demonstrativo." },
  { title: "Organização", desc: "Treinos organizados por dia, exercício, séries, repetições e descanso." },
  { title: "Evolução", desc: "Histórico completo de cargas, peso, medidas e fotos." },
  { title: "Alimentação", desc: "Nos planos elegíveis, registre refeições e acompanhe calorias e macros." },
];

export default function LandingPage() {
  const [plans, setPlans] = useState([]); const navigate=useNavigate();

  useEffect(() => {
    api.get("/plans").then((res) => setPlans(res.data)).catch(() => setPlans([]));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="px-6 py-20 max-w-5xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
          Seu treino. Seu objetivo. <span className="text-accent">Sua evolução.</span>
        </h1>
        <p className="text-muted mt-6 text-lg max-w-2xl mx-auto">
          Treinos personalizados, acompanhamento e ferramentas para você entender seu
          processo e evoluir de forma organizada.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Link
            to="/planos"
            className="bg-accent text-ink font-semibold px-6 py-3 rounded-full hover:bg-accentDark"
          >
            Conhecer os planos
          </Link>
          <WhatsAppButton
            className="border border-white/20 px-6 py-3 rounded-full hover:bg-white/10"
            label="Falar comigo pelo WhatsApp"
          />
        </div>
      </section>

      {/* O que a plataforma oferece */}
      <section className="px-6 py-16 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-8 text-center">O que a plataforma oferece</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-surface border border-white/10 rounded-2xl p-6">
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-muted text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quem está por trás */}
      <section className="px-6 py-16 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Quem está por trás da plataforma?</h2>
        <p className="text-muted leading-relaxed">
          Meu nome é Lucas Falco, tenho 21 anos, sou estudante de Educação Física e estou
          no último período de Engenharia de Software. Pratico tênis de mesa há
          aproximadamente 10 anos e sempre tive interesse em treinamento, desempenho e
          evolução. Criei o Lucas Falco Training para unir treinamento e tecnologia e
          tornar esse processo mais organizado, personalizado e fácil de acompanhar.
        </p>
      </section>

      {/* Planos */}
      <section id="planos" className="px-6 py-16 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-8 text-center">Planos</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} featured={plan.isFeatured} onSelect={(p)=>navigate("/checkout",{state:{plan:p}})} />
          ))}
          {plans.length === 0 && (
            <p className="text-muted col-span-3 text-center">
              Carregando planos... (verifique se a API está rodando)
            </p>
          )}
        </div>
      </section>

      <section className="px-6 py-16 text-center">
        <Link to="/quero-saber-mais" className="underline text-accent">
          Ainda tem dúvidas? Preencha o formulário "Quero saber mais"
        </Link>
      </section>
    </div>
  );
}
