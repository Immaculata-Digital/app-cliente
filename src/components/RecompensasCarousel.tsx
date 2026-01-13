import { useEffect, useState } from "react";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import type { PontosRecompensa } from "@/types/cliente-pontos-recompensas";
import { Card } from "@/components/ui/card";

interface RecompensasCarouselProps {
  itens: PontosRecompensa[];
}

export function RecompensasCarousel({ itens }: RecompensasCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();

  useEffect(() => {
    if (!api) {
      return;
    }

    // Auto-play: muda o slide a cada 4 segundos
    const interval = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        // Se não pode ir para frente, volta para o início
        api.scrollTo(0);
      }
    }, 4000);

    return () => {
      clearInterval(interval);
    };
  }, [api]);

  if (!itens || itens.length === 0) {
    return null;
  }

  return (
    <div className="w-full mb-6 flex justify-center">
      <div className="w-full max-w-xs">
        <Carousel
          setApi={setApi}
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {itens.map((item) => (
              <CarouselItem key={item.id_item_recompensa}>
                <Card className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                  <div className="flex flex-col items-center gap-2">
                    {item.foto && (
                      <div className="w-full aspect-square bg-muted rounded-lg overflow-hidden">
                        <img
                          src={item.foto}
                          alt={item.nome_item}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <h3 className="font-semibold text-sm text-foreground text-center">
                      {item.nome_item}
                    </h3>
                  </div>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  );
}

