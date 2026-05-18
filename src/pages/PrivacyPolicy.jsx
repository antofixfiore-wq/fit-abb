import React from "react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-24">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <img
            src="https://media.base44.com/images/public/6900e246d71384c10b97f155/49b0b5056_6cb7a69af_generated_image.png"
            alt="Fit ABB"
            className="w-9 h-9 object-contain"
          />
          <span className="text-[#E8FF00] font-bold text-lg">Fit ABB</span>
        </div>

        <h1 className="text-2xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-gray-400 mb-8 text-sm">Ultimo aggiornamento: maggio 2026</p>

        <div className="space-y-6 text-gray-300 leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">1. Titolare del trattamento</h2>
            <p className="text-sm">
              Il titolare del trattamento dei dati personali è <strong className="text-white">Fit ABB</strong>,
              raggiungibile all'indirizzo email: <a href="mailto:supporto@fit-abb.com" className="text-[#E8FF00] hover:underline">supporto@fit-abb.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">2. Dati raccolti</h2>
            <p className="text-sm mb-3">Raccogliamo i seguenti dati personali:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-4 text-sm">
              <li><strong className="text-white">Dati identificativi:</strong> nome completo, indirizzo email</li>
              <li><strong className="text-white">Dati di salute e fitness:</strong> peso corporeo, calorie bruciate, passi, frequenza cardiaca, ore di sonno, minuti di allenamento, idratazione</li>
              <li><strong className="text-white">Dati di utilizzo:</strong> storico accessi alle palestre, data e ora delle visite, tipo di abbonamento</li>
              <li><strong className="text-white">Dati di pagamento:</strong> gestiti in modo sicuro tramite Stripe (non conserviamo dati della carta)</li>
              <li><strong className="text-white">Dati tecnici:</strong> tipo di dispositivo, sistema operativo, log di utilizzo dell'app</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">3. Finalità del trattamento</h2>
            <ul className="list-disc list-inside space-y-1.5 ml-4 text-sm">
              <li>Erogazione del servizio di abbonamento palestre</li>
              <li>Tracciamento dei progressi fitness personali</li>
              <li>Gestione degli accessi alle strutture partner</li>
              <li>Elaborazione dei pagamenti</li>
              <li>Comunicazioni di servizio e supporto</li>
              <li>Miglioramento dell'app tramite dati aggregati e anonimizzati</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">4. Base giuridica</h2>
            <p className="text-sm">
              Il trattamento è basato sull'esecuzione del contratto di servizio (art. 6 par. 1 lett. b GDPR),
              sul consenso dell'utente per i dati di salute (art. 9 par. 2 lett. a GDPR) e sul legittimo interesse
              per il miglioramento del servizio.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">5. Condivisione dei dati</h2>
            <p className="text-sm mb-3">I dati non vengono venduti a terzi. Possono essere condivisi con:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-4 text-sm">
              <li><strong className="text-white">Palestre partner:</strong> esclusivamente i dati necessari alla validazione dell'accesso</li>
              <li><strong className="text-white">Stripe:</strong> per l'elaborazione sicura dei pagamenti</li>
              <li><strong className="text-white">Fornitori di infrastruttura cloud:</strong> per l'hosting del servizio</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">6. Conservazione dei dati</h2>
            <p className="text-sm">
              I dati vengono conservati per tutta la durata del rapporto contrattuale e per un periodo massimo
              di 24 mesi dalla cancellazione dell'account, salvo obblighi di legge.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">7. Diritti dell'utente</h2>
            <p className="text-sm mb-3">Ai sensi del GDPR hai diritto a:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-4 text-sm">
              <li>Accedere ai tuoi dati personali</li>
              <li>Rettificare dati inesatti</li>
              <li>Richiedere la cancellazione dell'account e dei dati</li>
              <li>Opporti al trattamento</li>
              <li>Portabilità dei dati</li>
              <li>Revocare il consenso in qualsiasi momento</li>
            </ul>
            <p className="text-sm mt-3">
              Per esercitare questi diritti scrivi a{" "}
              <a href="mailto:supporto@fit-abb.com" className="text-[#E8FF00] hover:underline">supporto@fit-abb.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">8. Cookie e tecnologie simili</h2>
            <p className="text-sm">
              L'app utilizza esclusivamente cookie tecnici necessari al funzionamento del servizio.
              Non utilizziamo cookie di profilazione o pubblicitari.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">9. Sicurezza</h2>
            <p className="text-sm">
              Adottiamo misure tecniche e organizzative adeguate per proteggere i tuoi dati da accessi
              non autorizzati, perdita o divulgazione, inclusa la crittografia HTTPS per tutte le comunicazioni.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">10. Contatti</h2>
            <p className="text-sm">
              Per qualsiasi domanda relativa alla privacy:{" "}
              <a href="mailto:supporto@fit-abb.com" className="text-[#E8FF00] hover:underline">supporto@fit-abb.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}