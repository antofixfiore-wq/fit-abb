import React from "react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center gap-3 mb-10">
          <img
            src="https://media.base44.com/images/public/6900e246d71384c10b97f155/49b0b5056_6cb7a69af_generated_image.png"
            alt="Fit ABB"
            className="w-10 h-10 object-contain"
          />
          <span className="text-[#E8FF00] font-bold text-xl">Fit ABB</span>
        </div>

        <h1 className="text-3xl font-bold mb-2">Termini e Condizioni</h1>
        <p className="text-gray-400 mb-10">Ultimo aggiornamento: maggio 2026</p>

        <div className="space-y-8 text-gray-300 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Accettazione dei termini</h2>
            <p>
              Utilizzando l'app Fit ABB accetti i presenti Termini e Condizioni. Se non accetti,
              ti invitiamo a non utilizzare il servizio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Descrizione del servizio</h2>
            <p>
              Fit ABB è una piattaforma che permette agli utenti di accedere a una rete di palestre partner
              tramite abbonamento mensile (Silver, Gold, Premium), tracciare i propri progressi fitness e
              acquistare servizi da Personal Trainer certificati.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Registrazione e account</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Devi avere almeno 16 anni per registrarti</li>
              <li>Le informazioni fornite devono essere veritiere e aggiornate</li>
              <li>Sei responsabile della sicurezza del tuo account e delle credenziali</li>
              <li>Non è consentito cedere o condividere l'account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Abbonamenti e pagamenti</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Gli abbonamenti si rinnovano automaticamente salvo disdetta</li>
              <li>I prezzi possono variare; le modifiche saranno comunicate con 30 giorni di preavviso</li>
              <li>Non sono previsti rimborsi per periodi parzialmente utilizzati</li>
              <li>I pagamenti sono processati in modo sicuro tramite Stripe</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Utilizzo delle palestre</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>L'accesso è consentito solo tramite il QR code o codice numerico generato nell'app</li>
              <li>Ogni palestra ha i propri regolamenti interni che l'utente è tenuto a rispettare</li>
              <li>Fit ABB non è responsabile per eventuali infortuni subiti nelle strutture partner</li>
              <li>L'accesso può essere revocato in caso di comportamento scorretto</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Contenuti utente</h2>
            <p>
              I contenuti pubblicati (post, foto, recensioni) devono essere rispettosi e non violare
              diritti di terzi. Fit ABB si riserva il diritto di rimuovere contenuti inappropriati.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Limitazione di responsabilità</h2>
            <p>
              Fit ABB non è responsabile per danni diretti o indiretti derivanti dall'utilizzo del servizio,
              interruzioni tecniche, o comportamenti di palestre partner o Personal Trainer terzi.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Modifiche al servizio</h2>
            <p>
              Ci riserviamo il diritto di modificare, sospendere o interrompere il servizio in qualsiasi
              momento, con ragionevole preavviso agli utenti attivi.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Legge applicabile</h2>
            <p>
              I presenti Termini sono regolati dalla legge italiana. Per qualsiasi controversia è competente
              il Foro di Brescia.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Contatti</h2>
            <p>
              Per informazioni:{" "}
              <a href="mailto:supporto@fit-abb.com" className="text-[#E8FF00] hover:underline">supporto@fit-abb.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}