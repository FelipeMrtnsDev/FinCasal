export interface CompanyData {
  name: string;
  logo: string;
}

const tokenSuffix = "?token=pk_Z2F68jmwQJ6kqUTBPmb6Ig&retina=true";

export const companyRegistry: Record<string, CompanyData> = {
  // Streaming e Entretenimento
  "netflix": { name: "Netflix", logo: `https://img.logo.dev/netflix.com${tokenSuffix}` },
  "spotify": { name: "Spotify", logo: `https://img.logo.dev/spotify.com${tokenSuffix}` },
  "disney": { name: "Disney+", logo: `https://img.logo.dev/disneyplus.com${tokenSuffix}` },
  "hbo": { name: "HBO Max", logo: `https://img.logo.dev/max.com${tokenSuffix}` },
  "amazon prime": { name: "Amazon Prime", logo: `https://img.logo.dev/primevideo.com${tokenSuffix}` },
  "youtube": { name: "YouTube", logo: `https://img.logo.dev/youtube.com${tokenSuffix}` },
  "apple music": { name: "Apple Music", logo: `https://img.logo.dev/apple.com${tokenSuffix}` },
  "deezer": { name: "Deezer", logo: `https://img.logo.dev/deezer.com${tokenSuffix}` },
  "twitch": { name: "Twitch", logo: `https://img.logo.dev/twitch.tv${tokenSuffix}` },
  "crunchyroll": { name: "Crunchyroll", logo: `https://img.logo.dev/crunchyroll.com${tokenSuffix}` },

  // Apps de Transporte e Delivery
  "99": { name: "99", logo: `https://img.logo.dev/99app.com${tokenSuffix}` },
  "uber": { name: "Uber", logo: `https://img.logo.dev/uber.com${tokenSuffix}` },
  "ifood": { name: "iFood", logo: `https://img.logo.dev/ifood.com.br${tokenSuffix}` },
  "rappi": { name: "Rappi", logo: `https://img.logo.dev/rappi.com.br${tokenSuffix}` },
  "ze delivery": { name: "Zé Delivery", logo: `https://img.logo.dev/ze.delivery${tokenSuffix}` },
  
  // E-commerce e Varejo
  "amazon": { name: "Amazon", logo: `https://img.logo.dev/amazon.com.br${tokenSuffix}` },
  "mercado livre": { name: "Mercado Livre", logo: `https://img.logo.dev/mercadolivre.com.br${tokenSuffix}` },
  "shopee": { name: "Shopee", logo: `https://img.logo.dev/shopee.com.br${tokenSuffix}` },
  "shein": { name: "Shein", logo: `https://img.logo.dev/shein.com${tokenSuffix}` },
  "magalu": { name: "Magalu", logo: `https://img.logo.dev/magazineluiza.com.br${tokenSuffix}` },
  "casas bahia": { name: "Casas Bahia", logo: `https://img.logo.dev/casasbahia.com.br${tokenSuffix}` },
  "americanas": { name: "Americanas", logo: `https://img.logo.dev/americanas.com.br${tokenSuffix}` },
  "ali express": { name: "AliExpress", logo: `https://img.logo.dev/aliexpress.com${tokenSuffix}` },

  // Supermercados e Farmácias
  "carrefour": { name: "Carrefour", logo: `https://img.logo.dev/carrefour.com.br${tokenSuffix}` },
  "pao de acucar": { name: "Pão de Açúcar", logo: `https://img.logo.dev/paodeacucar.com${tokenSuffix}` },
  "extra": { name: "Extra", logo: `https://img.logo.dev/clubeextra.com.br${tokenSuffix}` },
  "assai": { name: "Assaí", logo: `https://img.logo.dev/assai.com.br${tokenSuffix}` },
  "drogasil": { name: "Drogasil", logo: `https://img.logo.dev/drogasil.com.br${tokenSuffix}` },
  "pague menos": { name: "Pague Menos", logo: `https://img.logo.dev/paguemenos.com.br${tokenSuffix}` },
  "droga raia": { name: "Droga Raia", logo: `https://img.logo.dev/drogaraia.com.br${tokenSuffix}` },

  // Alimentação e Fast Food
  "mcdonalds": { name: "McDonald's", logo: `https://img.logo.dev/mcdonalds.com.br${tokenSuffix}` },
  "burger king": { name: "Burger King", logo: `https://img.logo.dev/burgerking.com.br${tokenSuffix}` },
  "starbucks": { name: "Starbucks", logo: `https://img.logo.dev/starbucks.com.br${tokenSuffix}` },
  "subway": { name: "Subway", logo: `https://img.logo.dev/subway.com.br${tokenSuffix}` },
  "outback": { name: "Outback", logo: `https://img.logo.dev/outback.com.br${tokenSuffix}` },
  "pizza hut": { name: "Pizza Hut", logo: `https://img.logo.dev/pizzahut.com.br${tokenSuffix}` },
  "cacau show": { name: "Cacau Show", logo: `https://img.logo.dev/cacaushow.com.br${tokenSuffix}` },
  "habibs": { name: "Habib's", logo: `https://img.logo.dev/habibs.com.br${tokenSuffix}` },

  // Operadoras e Serviços
  "vivo": { name: "Vivo", logo: `https://img.logo.dev/vivo.com.br${tokenSuffix}` },
  "claro": { name: "Claro", logo: `https://img.logo.dev/claro.com.br${tokenSuffix}` },
  "tim": { name: "TIM", logo: `https://img.logo.dev/tim.com.br${tokenSuffix}` },
  "oi": { name: "Oi", logo: `https://img.logo.dev/oi.com.br${tokenSuffix}` },
  "sky": { name: "Sky", logo: `https://img.logo.dev/sky.com.br${tokenSuffix}` },
  "enel": { name: "Enel", logo: `https://img.logo.dev/enel.com.br${tokenSuffix}` },
  "sabesp": { name: "Sabesp", logo: `https://img.logo.dev/sabesp.com.br${tokenSuffix}` },
  "aguas de manaus": { name: "Águas de Manaus", logo: `https://img.logo.dev/aguasdemanaus.com.br${tokenSuffix}` },

  // Tecnologia e SaaS
  "apple": { name: "Apple", logo: `https://img.logo.dev/apple.com${tokenSuffix}` },
  "google": { name: "Google", logo: `https://img.logo.dev/google.com${tokenSuffix}` },
  "microsoft": { name: "Microsoft", logo: `https://img.logo.dev/microsoft.com${tokenSuffix}` },
  "adobe": { name: "Adobe", logo: `https://img.logo.dev/adobe.com${tokenSuffix}` },
  "canva": { name: "Canva", logo: `https://img.logo.dev/canva.com${tokenSuffix}` },
  "chatgpt": { name: "ChatGPT (OpenAI)", logo: `https://img.logo.dev/openai.com${tokenSuffix}` },
  "github": { name: "GitHub", logo: `https://img.logo.dev/github.com${tokenSuffix}` },
  "linkedin": { name: "LinkedIn", logo: `https://img.logo.dev/linkedin.com${tokenSuffix}` },

  // Vestuário e Esporte
  "nike": { name: "Nike", logo: `https://img.logo.dev/nike.com.br${tokenSuffix}` },
  "adidas": { name: "Adidas", logo: `https://img.logo.dev/adidas.com.br${tokenSuffix}` },
  "zara": { name: "Zara", logo: `https://img.logo.dev/zara.com${tokenSuffix}` },
  "renner": { name: "Renner", logo: `https://img.logo.dev/lojasrenner.com.br${tokenSuffix}` },
  "riachuelo": { name: "Riachuelo", logo: `https://img.logo.dev/riachuelo.com.br${tokenSuffix}` },
  "cea": { name: "C&A", logo: `https://img.logo.dev/cea.com.br${tokenSuffix}` },
  "centauro": { name: "Centauro", logo: `https://img.logo.dev/centauro.com.br${tokenSuffix}` },
  "decathlon": { name: "Decathlon", logo: `https://img.logo.dev/decathlon.com.br${tokenSuffix}` },

  // Viagem e Lazer
  "latam": { name: "LATAM Airlines", logo: `https://img.logo.dev/latamairlines.com${tokenSuffix}` },
  "azul": { name: "Azul Linhas Aéreas", logo: `https://img.logo.dev/voeazul.com.br${tokenSuffix}` },
  "gol": { name: "GOL", logo: `https://img.logo.dev/voegol.com.br${tokenSuffix}` },
  "airbnb": { name: "Airbnb", logo: `https://img.logo.dev/airbnb.com.br${tokenSuffix}` },
  "booking": { name: "Booking.com", logo: `https://img.logo.dev/booking.com${tokenSuffix}` },
  "hoteis.com": { name: "Hoteis.com", logo: `https://img.logo.dev/hoteis.com${tokenSuffix}` },

  // Outros Comuns
  "petz": { name: "Petz", logo: `https://img.logo.dev/petz.com.br${tokenSuffix}` },
  "cobasi": { name: "Cobasi", logo: `https://img.logo.dev/cobasi.com.br${tokenSuffix}` },
  "smart fit": { name: "Smart Fit", logo: `https://img.logo.dev/smartfit.com.br${tokenSuffix}` },
  "shell": { name: "Posto Shell", logo: `https://img.logo.dev/shell.com.br${tokenSuffix}` },
  "ipiranga": { name: "Posto Ipiranga", logo: `https://img.logo.dev/ipiranga.com.br${tokenSuffix}` },
  "br": { name: "Posto Petrobras", logo: `https://img.logo.dev/petrobras.com.br${tokenSuffix}` },
};

export function getCompanyByDescription(description: string): CompanyData | null {
  const normalizedInput = description.toLowerCase().trim();
  
  if (companyRegistry[normalizedInput]) {
    return companyRegistry[normalizedInput];
  }
  
  const keys = Object.keys(companyRegistry).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (normalizedInput.includes(key)) {
      return companyRegistry[key];
    }
  }

  return null;
}
