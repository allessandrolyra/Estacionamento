"use client";

/**
 * Feedback inline — melhores práticas UX (NN/G, Form Creator)
 * - Mensagem próxima ao elemento que disparou a ação (proximidade)
 * - Animação suave para reduzir impacto visual
 * - Não cobre o input do usuário
 */
interface Props {
  message: string;
  type?: "success" | "error";
  className?: string;
}

export function FeedbackMessage({ message, type = "success", className = "" }: Props) {
  if (!message) return null;

  return (
    <div
      className={`feedback-message feedback-message--${type} ${className}`}
      role="status"
      aria-live="polite"
    >
      <span className="feedback-message__icon" aria-hidden>
        {type === "success" ? "✓" : "!"}
      </span>
      <span>{message}</span>
    </div>
  );
}
