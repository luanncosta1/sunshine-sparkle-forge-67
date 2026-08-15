import { createFileRoute } from "@tanstack/react-router";
import rushHero from "@/assets/rush_hero.jpg.asset.json";
import logoAsset from "@/assets/logo.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    title: "CLUBE DO RAUL | RUSH Night",
    meta: [
      { name: "description", content: "Clube do Raul apresenta RUSH Night. Tech House + House + Afro House. Garanta seu ingresso agora." },
      { property: "og:title", content: "CLUBE DO RAUL | RUSH Night" },
      { property: "og:description", content: "Clube do Raul apresenta RUSH Night. Tech House + House + Afro House. Garanta seu ingresso agora." },
      { property: "og:image", content: rushHero.url },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: rushHero.url },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Navbar */}
      <nav className="fixed w-full z-50 flex items-center px-4 md:px-8 py-2 md:py-3 bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <img src={logoAsset.url} alt="Logo" className="h-10 md:h-12 w-auto object-contain" />
          <div className="text-primary font-bold text-base md:text-lg tracking-[0.2em] font-['Archivo_Black'] uppercase leading-none">
            CLUBE DO RAUL
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative min-h-[80vh] md:min-h-screen flex flex-col items-center justify-center text-center px-4 pt-20 md:pt-0 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center brightness-[0.6]" 
          style={{ backgroundImage: `url(${rushHero.url})` }}
        />
        {/* Overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background" />
        
        <div className="relative z-10 space-y-4">
          <p className="text-primary font-bold tracking-[0.3em] text-sm md:text-base animate-in fade-in slide-in-from-top-4 duration-1000 uppercase">
            CLUBE DO RAUL PRESENTS
          </p>
          <h1 className="font-['Archivo_Black'] text-6xl sm:text-8xl md:text-[10rem] text-primary mb-2 md:mb-4 tracking-tighter leading-[0.8] animate-in zoom-in-95 duration-1000">
            RUSH
            <br />
            <span className="text-foreground italic font-sans text-4xl sm:text-6xl md:text-8xl tracking-normal block -mt-4 md:-mt-8">Night</span>
          </h1>
          <div className="flex flex-wrap justify-center gap-4 text-xs md:text-sm font-bold tracking-widest text-foreground/80 mb-8">
            <span className="border border-foreground/20 px-3 py-1">TECH HOUSE</span>
            <span className="text-primary">+</span>
            <span className="border border-foreground/20 px-3 py-1">HOUSE</span>
            <span className="text-primary">+</span>
            <span className="border border-foreground/20 px-3 py-1">AFRO HOUSE</span>
          </div>
          <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 md:px-12 py-3 md:py-4 rounded-full font-bold text-lg md:text-xl transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,69,0,0.5)]">
            COMPRAR INGRESSOS AGORA
          </button>
        </div>
      </header>

      {/* Tickets */}
      <section className="py-16 md:py-24 px-4 md:px-8 max-w-6xl mx-auto">
        <h2 className="text-center font-['Archivo_Black'] text-3xl md:text-4xl mb-12 md:16 text-primary">TIPOS DE INGRESSOS</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
          {[
            { name: "PISTA", price: "R$ 120,00" },
            { name: "VIP", price: "R$ 250,00" },
            { name: "CAMAROTE", price: "R$ 400,00" },
          ].map((ticket) => (
            <div key={ticket.name} className="bg-card border border-border p-8 rounded-2xl text-center">
              <h3 className="text-2xl font-bold mb-4">{ticket.name}</h3>
              <p className="text-3xl font-bold mb-8 text-primary">{ticket.price}</p>
              <button className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground py-3 rounded-xl font-bold transition-colors">
                Comprar Ingressos
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
              { time: "23:00 - 01:00", artist: "DJ NOVA" },
              { time: "01:00 - 03:00", artist: "DJ KAIRO" },
              { time: "03:00 - 05:00", artist: "DJ VYBE" },
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
          <h2 className="font-['Archivo_Black'] text-3xl md:text-4xl mb-8 md:12 text-primary">MAPA DO EVENTO</h2>
          <div className="aspect-[4/3] md:aspect-square bg-card border border-border rounded-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=1000')] bg-cover opacity-20 grayscale" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="size-8 bg-primary rounded-full animate-ping opacity-75" />
              <div className="absolute size-4 bg-primary rounded-full shadow-[0_0_20px_rgba(255,69,0,0.8)]" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer / Meta */}
      <footer className="border-t border-border py-12 px-8 text-sm">
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
        <div className="text-center mt-12 text-muted-foreground">© 2024 CLUBE DO RAUL | RUSH Night. Privacy Policy</div>
      </footer>
    </div>
  );
}
