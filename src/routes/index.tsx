import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    title: "Vibe Festival 2024 | A Noite da Sua Vida",
    meta: [
      { name: "description", content: "Garanta seu ingresso para o Vibe Festival 2024. A maior noite da sua vida com as melhores atrações." },
      { property: "og:title", content: "Vibe Festival 2024 | A Noite da Sua Vida" },
      { property: "og:description", content: "Garanta seu ingresso para o Vibe Festival 2024. A maior noite da sua vida com as melhores atrações." },
      { property: "og:image", content: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=2000" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=2000" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Navbar */}
      <nav className="fixed w-full z-50 flex items-center justify-between px-8 py-6">
        <div className="flex gap-8 text-sm font-medium">
          {["Início", "Programação", "Mapa de Evento", "Contato"].map((item) => (
            <a key={item} href="#" className="hover:text-primary transition-colors">
              {item}
            </a>
          ))}
        </div>
        <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-full font-bold text-sm">
          Comprar Ingressos
        </button>
      </nav>

      {/* Hero */}
      <header className="relative h-[80vh] flex flex-col items-center justify-center text-center px-4">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=2000')] bg-cover bg-center brightness-[0.3]" />
        <h1 className="relative font-['Archivo_Black'] text-6xl md:text-8xl text-primary mb-8 tracking-tighter">
          VIBE FESTIVAL 2024:
          <br />
          A NOITE DA SUA VIDA
        </h1>
        <button className="relative bg-primary hover:bg-primary/90 text-primary-foreground px-12 py-4 rounded-full font-bold text-xl transition-transform hover:scale-105">
          COMPRAR INGRESSOS AGORA
        </button>
      </header>

      {/* Tickets */}
      <section className="py-24 px-8 max-w-6xl mx-auto">
        <h2 className="text-center font-['Archivo_Black'] text-4xl mb-16 text-primary">TIPOS DE INGRESSOS</h2>
        <div className="grid md:grid-cols-3 gap-8">
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
      <section className="py-24 px-8 max-w-6xl mx-auto grid md:grid-cols-2 gap-16">
        <div>
          <h2 className="font-['Archivo_Black'] text-4xl mb-12 text-primary">PROGRAMAÇÃO</h2>
          <div className="space-y-8 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-primary/30">
            {[
              { time: "20:00 - 21:00", artist: "PISTA" },
              { time: "21:00 - 22:30", artist: "DJ RENATO" },
              { time: "22:30 - 00:00", artist: "VIBE BAND" },
              { time: "00:00 - 02:00", artist: "HEADLINER" },
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
          <h2 className="font-['Archivo_Black'] text-4xl mb-12 text-primary">MAPA DO EVENTO</h2>
          <div className="aspect-square bg-card border border-border rounded-2xl overflow-hidden relative">
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
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h4 className="font-bold">SOCIAL</h4>
            <div className="flex gap-4">
               {["Facebook", "Twitter", "Instagram", "YouTube"].map(s => <span key={s} className="size-8 rounded-full bg-muted flex items-center justify-center text-xs">{s[0]}</span>)}
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold">TERMOS</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>Início</li>
              <li>Mapa de Evento</li>
              <li>Contato</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold">NEWSLETTER</h4>
            <p className="text-muted-foreground">Sign up for updates via newsletter</p>
            <input type="email" placeholder="Enter email" className="w-full bg-muted border border-border p-3 rounded-lg" />
          </div>
        </div>
        <div className="text-center mt-12 text-muted-foreground">© 2024 Vibe Festival. Privacy Policy</div>
      </footer>
    </div>
  );
}
