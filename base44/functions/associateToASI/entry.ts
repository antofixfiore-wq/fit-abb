import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verifica che l'utente abbia caricato i documenti
    if (!user.asi_documents_uploaded) {
      return Response.json({ 
        error: 'Documenti ASI non ancora caricati',
        code: 'DOCUMENTS_NOT_UPLOADED'
      }, { status: 400 });
    }

    // Recupera dati utente
    const {
      full_name,
      email,
      address,
      city,
      cap,
      phone,
      codice_fiscale,
      subscription_type
    } = user;

    // Verifica dati obbligatori
    const requiredFields = ['full_name', 'email', 'codice_fiscale', 'address', 'city', 'cap', 'phone'];
    const missingFields = requiredFields.filter(field => !user[field]);
    
    if (missingFields.length > 0) {
      return Response.json({ 
        error: `Campi obbligatori mancanti: ${missingFields.join(', ')}`,
        code: 'MISSING_FIELDS'
      }, { status: 400 });
    }

    // Recupera documenti dall'entity ASIAssociation
    const associations = await base44.entities.ASIAssociation.filter({ 
      user_email: email 
    });
    
    const latestAssociation = associations.length > 0 
      ? associations[0] 
      : null;

    if (!latestAssociation) {
      return Response.json({ 
        error: 'Nessuna associazione ASI trovata',
        code: 'NO_ASSOCIATION'
      }, { status: 404 });
    }

    // Compilazione automatica form HTML ASI
    const formData = new URLSearchParams();
    formData.append('nome', full_name);
    formData.append('email', email);
    formData.append('codice_fiscale', codice_fiscale);
    formData.append('indirizzo', address);
    formData.append('citta', city);
    formData.append('cap', cap);
    formData.append('telefono', phone);
    formData.append('tipo_abbonamento', subscription_type);
    
    // Aggiungi URL documenti
    if (latestAssociation.document_urls && latestAssociation.document_urls.length > 0) {
      latestAssociation.document_urls.forEach((url, index) => {
        formData.append(`documenti[${index}]`, url);
      });
    }

    // Invio form HTML all'endpoint ASI
    const asiResponse = await fetch('https://api.asi.it/v1/associate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString()
    });

    const asiData = await asiResponse.json();

    if (!asiResponse.ok) {
      // Aggiorna stato fallito
      await base44.entities.ASIAssociation.update(latestAssociation.id, {
        status: 'failed',
        asi_response: JSON.stringify(asiData),
        asi_form_submitted: true
      });

      await base44.entities.User.update(user.email, {
        asi_association_status: 'failed'
      });

      return Response.json({ 
        error: 'Associazione ASI fallita',
        details: asiData,
        success: false
      }, { status: 500 });
    }

    // Aggiorna entity con esito positivo
    await base44.entities.ASIAssociation.update(latestAssociation.id, {
      status: 'completed',
      asi_form_submitted: true,
      asi_response: JSON.stringify(asiData),
      association_date: new Date().toISOString()
    });

    await base44.entities.User.update(user.email, {
      asi_association_status: 'completed'
    });

    console.log('Associazione ASI completata per:', email);

    return Response.json({ 
      success: true,
      message: 'Associazione ASI completata con successo',
      asi_data: asiData
    });

  } catch (error) {
    console.error('Errore associazione ASI:', error);
    return Response.json({ 
      error: error.message,
      success: false
    }, { status: 500 });
  }
});