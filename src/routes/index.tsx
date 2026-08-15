import { createFileRoute } from "@tanstack/react-router";
import logoAsset from "@/assets/club_do_raul_logo.png.asset.json";
import esquentaHero from "@/assets/esquenta_clube_do_raul.png.asset.json";
import bgAsset from "@/assets/BG.png.asset.json";
import mapPinAsset from "@/assets/map_pin.png.asset.json";
import { useEffect, useState } from "react";
import { createCheckout } from "@/lib/payments.functions";
import { toast } from "sonner";


export const Route = createFileRoute("/")({
  head: () => ({
    title: "CLUBE DO RAUL | Esquenta Carnaval 2026",
    meta: [
      { name: "description", content: "Clube do Raul apresenta Esquenta Carnaval 2026. Novo Hit + Thiago Paraguassu + Daneil Bonner. Garanta seu ingresso agora." },
      { property: "og:title", content: "CLUBE DO RAUL | Esquenta Carnaval 2026" },
      { property: "og:description", content: "Clube do Raul apresenta Esquenta Carnaval 2026. Novo Hit + Thiago Paraguassu + Daneil Bonner. Garanta seu ingresso agora." },
      { property: "og:image", content: esquentaHero.url },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: esquentaHero.url },
    ],
  }),
  component: Index,
});

function Index() {
  const [loadingTicket, setLoadingTicket] = useState<string | null>(null);

  useEffect(() => {
    // Force a check for new content when the user returns to the page
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.update();
      });
    }
  }, []);

  const handlePurchase = async (ticketType: string) => {
    setLoadingTicket(ticketType);
    try {
      const response = await createCheckout({
        data: {
          ticketType,
          quantity: 1
        }
      });
      
      const checkoutUrl = response.checkoutUrl;
      
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        throw new Error("Checkout URL not found");
      }
    } catch (error) {
      console.error("Purchase error:", error);
      toast.error("Erro ao iniciar a compra. Tente novamente ou use o WhatsApp.");
    } finally {
      setLoadingTicket(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed w-full z-50 flex items-center justify-between px-4 md:px-8 py-2 md:py-3 bg-background/80 backdrop-blur-md border-b border-white/10">
        <div className="flex-1 flex justify-start">
          <img src={logoAsset.url} alt="Logo Clube do Raul" className="h-8 md:h-10 w-auto object-contain" />
        </div>
        <div className="text-primary font-bold text-base md:text-lg tracking-[0.2em] font-['Archivo_Black'] uppercase absolute left-1/2 -translate-x-1/2 whitespace-nowrap">
          CLUBE DO RAUL
        </div>
        <div className="flex-1" />
      </nav>

      {/* Hero */}
      <header className="relative min-h-[80vh] md:min-h-screen flex flex-col items-center justify-center text-center px-4 pt-20 md:pt-0 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center brightness-[0.8]" 
          style={{ backgroundImage: `url(${esquentaHero.url})` }}
        />
        {/* Overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background" />
        
        <div className="relative z-10 space-y-4">
          <div className="h-20" /> {/* Spacer */}
        </div>
      </header>

      {/* Tickets */}
      <section className="py-16 md:py-24 px-4 md:px-8 max-w-6xl mx-auto -mt-20 relative z-20">
        {/* Lower section background starting from the button */}
        <div 
          className="absolute inset-0 top-[20px] -bottom-[100%] left-0 right-0 bg-cover bg-center pointer-events-none opacity-30 z-[-1]" 
          style={{ backgroundImage: `url(${bgAsset.url})` }}
        />

        <div className="flex justify-center mb-8">
          <button 
            onClick={() => handlePurchase("PISTA")}
            disabled={loadingTicket !== null}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-2 rounded-full font-bold text-base transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(255,69,0,0.4)] disabled:opacity-50 disabled:cursor-wait"
          >
            {loadingTicket === "PISTA" ? "CARREGANDO..." : "COMPRAR INGRESSOS AGORA"}
          </button>
        </div>
        <h2 className="text-center font-['Archivo_Black'] text-3xl md:text-4xl mb-12 md:16 text-primary">TIPOS DE INGRESSOS</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
          {[
            { name: "PISTA", price: "R$ 1,00" },
            { name: "VIP", price: "R$ 1,00" },
            { name: "CAMAROTE", price: "R$ 1,00" },
          ].map((ticket) => (
            <div key={ticket.name} className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-2xl text-center">
              <h3 className="text-2xl font-bold mb-4">{ticket.name}</h3>
              <p className="text-3xl font-bold mb-8 text-primary">{ticket.price}</p>
              <button 
                onClick={() => handlePurchase(ticket.name)}
                disabled={loadingTicket !== null}
                className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground py-3 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-wait"
              >
                {loadingTicket === ticket.name ? "Carregando..." : "Comprar Ingressos"}
              </button>
            </div>
          ))}
        </div>
      </section>
      {/* Schedule and Map */}
      <section className="py-16 md:py-24 px-4 md:px-8 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
        <div>
          <h2 className="font-['Archivo_Black'] text-3xl md:text-4xl mb-8 md:12 text-primary">PROGRAMAÇÃO</h2>
          <div className="space-y-8 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-primary/30">
            {[
              { time: "07.FEV", artist: "A PARTIR DAS 21H" },
              { time: "ELAS FREE", artist: "ATÉ ÀS 22H" },
            ].map((item) => (
              <div key={item.artist} className="pl-8 relative">
                <div className="absolute left-0 top-2 size-4 rounded-full bg-primary" />
                <div className="text-sm text-primary font-bold">{item.time}</div>
                <div className="text-xl font-bold">{item.artist}</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="font-['Archivo_Black'] text-3xl md:text-4xl mb-8 md:12 text-primary text-center md:text-left">MAPA DO EVENTO</h2>
          <div className="flex justify-center md:justify-start">
            <img 
              src={mapPinAsset.url} 
              alt="Mapa do Evento" 
              className="w-full max-w-[400px] h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform cursor-pointer"
              onClick={() => window.open("https://www.google.com/maps/search/?api=1&query=-12.0746355%2C-45.7293565", "_blank", "noopener,noreferrer")}
            />

          </div>

        </div>
      </section>

      {/* Footer / Meta */}
      <footer className="border-t border-border py-12 px-8 text-sm relative z-20 overflow-hidden">
        {/* Continue background in footer */}
        <div 
          className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-30 z-[-1]" 
          style={{ 
            backgroundImage: `url(${bgAsset.url})`,
            backgroundPosition: 'center bottom'
          }} 
        />

        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12 text-center sm:text-left">
          <div className="space-y-4 flex flex-col items-center sm:items-start order-2 sm:order-1">
            <h4 className="font-bold w-full text-center">SOCIAL</h4>
            <div className="flex gap-8 justify-center w-full">
              <a 
                href="https://www.instagram.com/club_do_raul?igsh=ZXllYXZ5cmt4cDlv" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-4xl hover:text-primary transition-colors hover:scale-110"
              >
                <i className="fa-brands fa-instagram"></i>
              </a>
              <a 
                href="https://wa.me/+5577998498472?text=Ol%C3%A1!%20Vim%20pelo%20site,%20quero%20mais%20informa%C3%A7%C3%B5es%20sobre%20os%20ingressos." 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-4xl hover:text-primary transition-colors hover:scale-110"
              >
                <i className="fa-brands fa-whatsapp"></i>
              </a>
            </div>
          </div>
          <div className="space-y-4 order-3 sm:order-2">
            <h4 className="font-bold">TERMOS</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>Início</li>
              <li>Mapa de Evento</li>
              <li>Contato</li>
            </ul>
          </div>
          <div className="space-y-4">
          </div>
        </div>
        <div className="text-center mt-12 text-muted-foreground">© 2024 CLUBE DO RAUL | Esquenta Carnaval 2026. Privacy Policy</div>
      </footer>
    </div>
  );
}
