// Composant drapeaux SVG — 10 pays africains AFRI-HUB
// Drapeaux dessinés avec les vraies couleurs officielles

interface FlagProps {
  code: string;
  size?: number;
  className?: string;
}

const flags: Record<string, JSX.Element> = {

  // 🇸🇳 Sénégal — Vert | Jaune | Rouge + étoile verte
  senegal: (
    <svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
      <rect width="300" height="600" fill="#00853F"/>
      <rect x="300" width="300" height="600" fill="#FDEF42"/>
      <rect x="600" width="300" height="600" fill="#E31B23"/>
      <polygon points="450,220 467,273 523,273 478,305 495,358 450,326 405,358 422,305 377,273 433,273"
        fill="#00853F"/>
    </svg>
  ),

  // 🇨🇮 Côte d'Ivoire — Orange | Blanc | Vert
  cotedivoire: (
    <svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
      <rect width="300" height="600" fill="#F77F00"/>
      <rect x="300" width="300" height="600" fill="#FFFFFF"/>
      <rect x="600" width="300" height="600" fill="#009A44"/>
    </svg>
  ),

  // 🇲🇱 Mali — Vert | Jaune | Rouge
  mali: (
    <svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
      <rect width="300" height="600" fill="#14B53A"/>
      <rect x="300" width="300" height="600" fill="#FCD116"/>
      <rect x="600" width="300" height="600" fill="#CE1126"/>
    </svg>
  ),

  // 🇬🇭 Ghana — Rouge | Or | Vert + étoile noire
  ghana: (
    <svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
      <rect width="900" height="200" fill="#006B3F"/>
      <rect y="200" width="900" height="200" fill="#FCD116"/>
      <rect y="400" width="900" height="200" fill="#CE1126"/>
      <polygon points="450,220 467,273 523,273 478,305 495,358 450,326 405,358 422,305 377,273 433,273"
        fill="#000000"/>
    </svg>
  ),

  // 🇳🇬 Nigeria — Vert | Blanc | Vert
  nigeria: (
    <svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
      <rect width="300" height="600" fill="#008751"/>
      <rect x="300" width="300" height="600" fill="#FFFFFF"/>
      <rect x="600" width="300" height="600" fill="#008751"/>
    </svg>
  ),

  // 🇰🇪 Kenya — Noir | Rouge | Vert + bouclier Maasai
  kenya: (
    <svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
      <rect width="900" height="600" fill="#006600"/>
      <rect y="175" width="900" height="250" fill="#BB0000"/>
      <rect y="200" width="900" height="200" fill="#BB0000"/>
      <rect width="900" height="175" fill="#000000"/>
      <rect y="425" width="900" height="175" fill="#000000"/>
      <rect y="165" width="900" height="35" fill="#FFFFFF"/>
      <rect y="400" width="900" height="35" fill="#FFFFFF"/>
      {/* Bouclier Maasai simplifié */}
      <ellipse cx="450" cy="300" rx="35" ry="80" fill="#BB0000" stroke="#FFFFFF" strokeWidth="4"/>
      <ellipse cx="450" cy="300" rx="20" ry="50" fill="#000000"/>
      <line x1="450" y1="200" x2="450" y2="400" stroke="#FFFFFF" strokeWidth="5"/>
      <line x1="415" y1="300" x2="485" y2="300" stroke="#FFFFFF" strokeWidth="4"/>
    </svg>
  ),

  // 🇨🇲 Cameroun — Vert | Rouge | Jaune + étoile
  cameroon: (
    <svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
      <rect width="300" height="600" fill="#007A5E"/>
      <rect x="300" width="300" height="600" fill="#CE1126"/>
      <rect x="600" width="300" height="600" fill="#FCD116"/>
      <polygon points="450,220 467,273 523,273 478,305 495,358 450,326 405,358 422,305 377,273 433,273"
        fill="#FCD116"/>
    </svg>
  ),

  // 🇧🇯 Bénin — Vert | Jaune | Rouge (horizontal)
  benin: (
    <svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
      <rect width="360" height="600" fill="#008751"/>
      <rect x="360" width="540" height="300" fill="#FCD116"/>
      <rect x="360" y="300" width="540" height="300" fill="#CE1126"/>
    </svg>
  ),

  // 🇨🇬 Congo — Vert | Jaune diagonal | Rouge
  congo: (
    <svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
      <rect width="900" height="600" fill="#009543"/>
      <polygon points="0,600 900,0 900,600" fill="#DC241F"/>
      <polygon points="0,0 900,0 0,600" fill="#009543"/>
      <polygon points="0,500 800,0 900,0 900,100 100,600 0,600" fill="#FBDE4A"/>
    </svg>
  ),

  // 🇺🇬 Ouganda — 6 bandes + couronne de grue
  uganda: (
    <svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
      <rect width="900" height="100" fill="#000000"/>
      <rect y="100" width="900" height="100" fill="#FCDC04"/>
      <rect y="200" width="900" height="100" fill="#DE3908"/>
      <rect y="300" width="900" height="100" fill="#000000"/>
      <rect y="400" width="900" height="100" fill="#FCDC04"/>
      <rect y="500" width="900" height="100" fill="#DE3908"/>
      {/* Cercle blanc central */}
      <circle cx="450" cy="300" r="110" fill="#FFFFFF"/>
      {/* Grue couronnée simplifiée */}
      <ellipse cx="450" cy="320" rx="45" ry="60" fill="#8B4513"/>
      <ellipse cx="450" cy="270" rx="25" ry="30" fill="#F5F5DC"/>
      <circle cx="450" cy="250" r="18" fill="#F5F5DC"/>
      <circle cx="450" cy="248" r="8" fill="#000000"/>
      <rect x="440" y="215" width="20" height="5" fill="#DC143C"/>
      {/* Pattes */}
      <line x1="435" y1="375" x2="425" y2="410" stroke="#8B4513" strokeWidth="6"/>
      <line x1="465" y1="375" x2="475" y2="410" strokeColor="#8B4513" stroke="#8B4513" strokeWidth="6"/>
    </svg>
  ),
};

export default function Flag({ code, size = 48, className = "" }: FlagProps) {
  const flag = flags[code.toLowerCase()];

  if (!flag) {
    // Fallback : cercle avec initiales si pays inconnu
    return (
      <div
        style={{ width: size, height: size * 0.67 }}
        className={`rounded-md bg-gradient-to-br from-amber-400 to-red-500 flex items-center justify-center ${className}`}
      >
        <span className="text-white font-black text-xs">{code.slice(0, 2).toUpperCase()}</span>
      </div>
    );
  }

  return (
    <div
      style={{ width: size, height: size * 0.67 }}
      className={`rounded-md overflow-hidden flex-shrink-0 shadow-sm ${className}`}
    >
      {flag}
    </div>
  );
}