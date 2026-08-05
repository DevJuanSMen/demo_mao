import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Check } from "lucide-react";

export function ComingSoon({
  title,
  phase,
  description,
  features,
}: {
  title: string;
  phase: string;
  description: string;
  features: string[];
}) {
  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <div className="text-center">
        <Badge className="mb-3 bg-violet-100 text-violet-700 hover:bg-violet-100">
          <Sparkles className="mr-1 h-3 w-3" /> {phase} del roadmap
        </Badge>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="mt-2 text-neutral-500">{description}</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <p className="mb-3 text-sm font-medium text-neutral-700">
            Lo que incluirá este módulo:
          </p>
          <ul className="space-y-2">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-neutral-600">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
                {f}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
