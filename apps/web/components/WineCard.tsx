import { WineCard as WineCardType } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function WineCard({ wine }: { wine: WineCardType }) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-1">
        <CardTitle className="text-sm font-semibold">{wine.name}</CardTitle>
        <p className="text-xs text-muted-foreground">
          {wine.type} · {wine.region}, {wine.country}
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        {wine.tasting_notes && (
          <p className="text-xs text-muted-foreground">{wine.tasting_notes}</p>
        )}
        <p className="text-sm font-medium mt-1">
          HKD {wine.price_hkd}
          {wine.score ? ` · ${wine.score}/100` : ""}
        </p>
      </CardContent>
    </Card>
  );
}
