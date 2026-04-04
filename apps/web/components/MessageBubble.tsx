import { WineCard as WineCardType } from "@/lib/api";
import WineCard from "./WineCard";

interface Props {
  role: "user" | "assistant";
  content: string;
  recommendations?: WineCardType[];
}

export default function MessageBubble({ role, content, recommendations }: Props) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`max-w-[75%] flex flex-col gap-2 ${isUser ? "items-end" : "items-start"}`}
      >
        <div
          className={`rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap ${
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground"
          }`}
        >
          {content}
        </div>
        {recommendations && recommendations.length > 0 && (
          <div className="flex flex-col gap-2 w-full">
            {recommendations.map((wine) => (
              <WineCard key={wine.id} wine={wine} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
