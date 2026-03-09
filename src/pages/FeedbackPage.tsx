import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Bug, Lightbulb, Star, Send, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const feedbackTypes = [
  { id: "bug", label: "Reportar Bug", icon: Bug, color: "text-destructive" },
  { id: "feature", label: "Sugerir Feature", icon: Lightbulb, color: "text-primary" },
  { id: "improvement", label: "Melhoria", icon: Star, color: "text-yellow-500" },
  { id: "other", label: "Outro", icon: MessageSquare, color: "text-muted-foreground" },
];

export default function FeedbackPage() {
  const [type, setType] = useState("feature");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!title.trim() || !description.trim()) return;
    // In production, save to Supabase
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setTitle("");
      setDescription("");
    }, 3000);
  };

  return (
    <div className="p-6 md:p-8 max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" /> Feedback
        </h1>
        <p className="text-sm text-muted-foreground">
          Ajude-nos a melhorar o Contuit com seu feedback
        </p>
      </div>

      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-xl border border-primary/20 bg-primary/5 p-8 text-center"
          >
            <CheckCircle className="mx-auto h-12 w-12 text-primary mb-4" />
            <h2 className="text-lg font-semibold text-foreground">Obrigado pelo seu feedback!</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Sua contribuição nos ajuda a construir um produto melhor.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-5"
          >
            {/* Type Selection */}
            <div className="space-y-2">
              <Label>Tipo de Feedback</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {feedbackTypes.map((ft) => (
                  <button
                    key={ft.id}
                    onClick={() => setType(ft.id)}
                    className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-sm transition-all ${
                      type === ft.id
                        ? "border-primary bg-primary/10 font-medium"
                        : "border-border bg-card text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    <ft.icon className={`h-5 w-5 ${ft.color}`} />
                    <span className={type === ft.id ? "text-primary" : ""}>{ft.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                placeholder="Resumo breve do seu feedback"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                placeholder="Descreva com detalhes..."
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <Button variant="hero" onClick={handleSubmit} disabled={!title.trim() || !description.trim()}>
              <Send className="mr-1 h-4 w-4" /> Enviar Feedback
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent submissions placeholder */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold text-foreground mb-3">Seus feedbacks recentes</h2>
        <div className="space-y-3">
          {[
            { title: "Adicionar exportação para Excel", type: "feature", status: "Em análise", date: "5 Mar 2026" },
            { title: "Gráfico não carrega no mobile", type: "bug", status: "Resolvido", date: "1 Mar 2026" },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg bg-secondary p-3">
              <div>
                <p className="text-sm font-medium text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.type} · {item.date}</p>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                item.status === "Resolvido" ? "bg-primary/10 text-primary" : "bg-yellow-500/10 text-yellow-600"
              }`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
