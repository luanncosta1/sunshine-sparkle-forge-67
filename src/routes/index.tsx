import { createFileRoute } from "@tanstack/react-router";
const logoAsset = { url: "/images/club_do_raul_logo.png" };
const esquentaHero = { url: "/images/esquenta_clube_do_raul.png" };
const bgAsset = { url: "/images/BG.png" };
const mapPinAsset = { url: "/images/map_pin.png" };
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createCheckout, getTicketLots } from "@/lib/payments.functions";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface TicketLot {
  ticket_type: string;
  lot_number: number;
  total_quantity: number;
  sold_quantity: number;
  available_quantity: number;
  price: number;
}

const formatPrice = (cents: number) =>
  `R$ ${(cents / 100).toFixed(2).replace(".", ",")}`;

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

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, ease: "easeOut" as const }
};

const staggerContainer = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.1 } },
  viewport: { once: true }
};

const formatWhatsapp = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

function Index() {
  const [loadingTicket, setLoadingTicket] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [step, setStep] = useState<"input" | "confirm">("input");
  const [whatsapp, setWhatsapp] = useState("");

  // Real stock from the database, refreshed periodically
  const { data: lots } = useQuery<TicketLot[]>({
    queryKey: ["ticket-lots"],
    queryFn: () => getTicketLots(),
    refetchInterval: 15000,
  });

  const getLot = (type: string) => lots?.find((l) => l.ticket_type === type);

  useEffect(() => {
    // Force a check for new content when the user returns to the page
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.update();
      });
    }
  }, []);

  const digits = whatsapp.replace(/\D/g, "");

  const openWhatsappStep = (ticketType: string) => {
    setSelectedTicket(ticketType);
    setStep("input");
  };

  const closeModal = () => {
    if (loadingTicket) return;
    setSelectedTicket(null);
    setStep("input");
  };

  const handlePurchase = async (ticketType: string) => {
    setLoadingTicket(ticketType);
    try {
      const response = await createCheckout({
        data: {
          ticketType,
          quantity: 1,
          whatsapp: `+55${digits}`,
          whatsappConfirmed: true
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
      const message = error instanceof Error && error.message
        ? error.message
        : "Erro ao iniciar a compra. Tente novamente ou use o WhatsApp.";
      toast.error(message);
    } finally {
      setLoadingTicket(null);
    }
  };


  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed w-full z-50 flex items-center justify-between px-4 md:px-8 py-2 md:py-3 bg-background/80 backdrop-blur-md border-b border-white/10">
        <div className="flex-1 flex justify-start">
          <motion.img 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            src={logoAsset.url} 
            alt="Logo Clube do Raul" 
            className="h-8 md:h-10 w-auto object-contain" 
          />
        </div>
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-primary font-bold text-base md:text-lg tracking-[0.2em] font-['Archivo_Black'] uppercase absolute left-1/2 -translate-x-1/2 whitespace-nowrap"
        >
          CLUBE DO RAUL
        </motion.div>
        <div className="flex-1" />
      </nav>

      {/* Hero */}
      <header className="relative min-h-[80vh] md:min-h-screen flex flex-col items-center justify-center text-center px-4 pt-20 md:pt-0 overflow-hidden">
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2 }}
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

        <motion.div 
          {...fadeInUp}
          className="flex justify-center mb-8"
        >
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => openWhatsappStep("PISTA")}
            disabled={loadingTicket !== null}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-2 rounded-full font-bold text-base transition-all hover:shadow-[0_0_20px_rgba(255,69,0,0.4)] disabled:opacity-50 disabled:cursor-wait"
          >
            {loadingTicket === "PISTA" ? "CARREGANDO..." : "COMPRAR INGRESSOS AGORA"}
          </motion.button>
        </motion.div>
        
        <motion.h2 
          {...fadeInUp}
          className="text-center font-['Archivo_Black'] text-3xl md:text-4xl mb-12 md:16 text-primary"
        >
          TIPOS DE INGRESSOS
        </motion.h2>

        <motion.div 
          variants={staggerContainer}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 max-w-3xl mx-auto"
        >
          {[
            { name: "PISTA", fallbackPrice: 3000 },
            { name: "CASADINHA", fallbackPrice: 5000 },
          ].map((ticket) => {
            const lot = getLot(ticket.name);
            const total = lot?.total_quantity ?? 100;
            const available = lot?.available_quantity ?? 100;
            const soldOut = available <= 0;
            const percent = Math.max(0, Math.min(100, (available / total) * 100));

            return (
              <motion.div 
                key={ticket.name}
                variants={fadeInUp}
                whileHover={{ y: -10 }}
                className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-2xl text-center group"
              >
                <h3 className="text-2xl font-bold mb-4">{ticket.name}</h3>
                <p className="text-3xl font-bold mb-6 text-primary group-hover:scale-110 transition-transform">
                  {formatPrice(lot?.price ?? ticket.fallbackPrice)}
                </p>

                {/* 1st lot stock counter (real, from database) */}
                <div className="mb-8 space-y-2">
                  <div className="text-xs font-bold tracking-[0.2em] text-primary">
                    {lot ? `${lot.lot_number}º LOTE` : "1º LOTE"}
                  </div>
                  <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${percent}%` }}
                      viewport={{ once: true }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={`h-full rounded-full ${soldOut ? "bg-muted-foreground" : "bg-primary"}`}
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {soldOut ? (
                      <span className="text-primary font-bold">1º LOTE ESGOTADO</span>
                    ) : (
                      <>{available} de {total} ingressos disponíveis</>
                    )}
                  </div>
                </div>

                <motion.button 
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openWhatsappStep(ticket.name)}
                  disabled={loadingTicket !== null || soldOut}
                  className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground py-3 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {soldOut
                    ? "1º LOTE ESGOTADO"
                    : loadingTicket === ticket.name
                      ? "Carregando..."
                      : "Comprar Ingressos"}
                </motion.button>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* Schedule and Map */}
      <motion.section 
        variants={staggerContainer}
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true }}
        className="py-16 md:py-24 px-4 md:px-8 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16"
      >
        <motion.div variants={fadeInUp}>
          <h2 className="font-['Archivo_Black'] text-3xl md:text-4xl mb-8 md:12 text-primary">PROGRAMAÇÃO</h2>
          <div className="space-y-8 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-primary/30">
            {[
              { time: "07.FEV", artist: "A PARTIR DAS 21H" },
              { time: "ELAS FREE", artist: "ATÉ ÀS 22H" },
            ].map((item) => (
              <motion.div 
                key={item.artist} 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="pl-8 relative"
              >
                <div className="absolute left-0 top-2 size-4 rounded-full bg-primary" />
                <div className="text-sm text-primary font-bold">{item.time}</div>
                <div className="text-xl font-bold">{item.artist}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        <motion.div variants={fadeInUp}>
          <h2 className="font-['Archivo_Black'] text-3xl md:text-4xl mb-8 md:12 text-primary text-center md:text-left">MAPA DO EVENTO</h2>
          <div className="flex justify-center md:justify-start">
            <motion.img 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              src={mapPinAsset.url} 
              alt="Mapa do Evento" 
              className="w-full max-w-[400px] h-auto object-contain drop-shadow-2xl cursor-pointer"
              onClick={() => window.open("https://www.google.com/maps/search/?api=1&query=-12.0746355%2C-45.7293565", "_blank", "noopener,noreferrer")}
            />
          </div>
        </motion.div>
      </motion.section>

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

        <motion.div 
          {...fadeInUp}
          className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12 text-center sm:text-left"
        >
          <div className="space-y-4 flex flex-col items-center sm:items-start order-2 sm:order-1">
            <h4 className="font-bold w-full text-center">SOCIAL</h4>
            <div className="flex gap-8 justify-center w-full">
              <motion.a 
                whileHover={{ scale: 1.2, color: "var(--primary)" }}
                href="https://www.instagram.com/club_do_raul?igsh=ZXllYXZ5cmt4cDlv" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-4xl transition-colors"
              >
                <i className="fa-brands fa-instagram"></i>
              </motion.a>
              <motion.a 
                whileHover={{ scale: 1.2, color: "var(--primary)" }}
                href="https://wa.me/+5577998498472?text=Ol%C3%A1!%20Vim%20pelo%20site,%20quero%20mais%20informa%C3%A7%C3%B5es%20sobre%20os%20ingressos." 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-4xl transition-colors"
              >
                <i className="fa-brands fa-whatsapp"></i>
              </motion.a>
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
        </motion.div>
        <motion.div 
          {...fadeInUp}
          className="text-center mt-12 text-muted-foreground"
        >
          © 2024 CLUBE DO RAUL | Esquenta Carnaval 2026. Privacy Policy
        </motion.div>
      </footer>

      {/* WhatsApp confirmation step (before PagBank checkout) */}
      {selectedTicket && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
          onClick={closeModal}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-card/95 border border-primary/30 rounded-2xl p-6 md:p-8 shadow-2xl"
          >
            <h3 className="font-['Archivo_Black'] text-xl md:text-2xl text-primary text-center mb-2">
              CONFIRA SEU WHATSAPP COM ATENÇÃO
            </h3>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Seu ingresso será enviado para este número após a confirmação do
              pagamento. Se o número estiver errado, você poderá não receber seu
              ingresso.
            </p>

            {step === "input" ? (
              <>
                <label className="block text-xs font-bold tracking-[0.15em] text-primary mb-2">
                  SEU WHATSAPP (COM DDD)
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  autoFocus
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(formatWhatsapp(e.target.value))}
                  placeholder="(77) 99999-9999"
                  className="w-full bg-white/5 border border-white/15 focus:border-primary outline-none rounded-xl px-4 py-3 text-lg text-foreground placeholder:text-muted-foreground mb-6 transition-colors"
                />
                <button
                  onClick={() => setStep("confirm")}
                  disabled={digits.length < 10}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-xl font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  CONTINUAR
                </button>
                <button
                  onClick={closeModal}
                  className="w-full mt-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancelar
                </button>
              </>
            ) : (
              <>
                <div className="rounded-xl border border-primary/40 bg-primary/10 px-4 py-5 text-center mb-6">
                  <div className="text-xs tracking-[0.2em] text-muted-foreground mb-1">
                    NÚMERO INFORMADO
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    +55 {whatsapp}
                  </div>
                </div>
                <p className="text-center font-bold mb-4">O número está correto?</p>
                <div className="space-y-3">
                  <button
                    onClick={() => handlePurchase(selectedTicket)}
                    disabled={loadingTicket !== null}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-wait"
                  >
                    {loadingTicket ? "REDIRECIONANDO..." : "SIM, ESTÁ CORRETO"}
                  </button>
                  <button
                    onClick={() => setStep("input")}
                    disabled={loadingTicket !== null}
                    className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground py-3 rounded-xl font-bold transition-colors disabled:opacity-50"
                  >
                    CORRIGIR NÚMERO
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
