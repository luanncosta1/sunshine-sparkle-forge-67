import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
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
