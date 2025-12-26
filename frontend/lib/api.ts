// lib/api.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Recupera la classifica dal backend
 */
export async function getRanking() {
  try {
    const res = await fetch(`${BASE_URL}/ranking`);
    if (!res.ok) {
      throw new Error(`Errore nel recupero della classifica: ${res.status}`);
    }
    return res.json(); // restituisce dati JSON
  } catch (error) {
    console.error("Errore fetch getRanking:", error);
    throw error;
  }
}

/**
 * Invia il voto dell'utente al backend
 * @param user - nome dell'utente
 * @param ordered_gifts - array di regali ordinati
 */
export async function sendVote(user: string, ordered_gifts: string[]) {
  try {
    const res = await fetch(`${BASE_URL}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user, ordered_gifts }),
    });

    if (!res.ok) {
      throw new Error(`Errore nell'invio del voto: ${res.status}`);
    }

    return res.json();
  } catch (error) {
    console.error("Errore fetch sendVote:", error);
    throw error;
  }
}
