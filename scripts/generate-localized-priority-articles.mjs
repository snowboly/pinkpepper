import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const articles = [
  {
    slug: "how-to-create-a-haccp-plan-step-by-step",
    category: "Compliance",
    image: "https://images.pexels.com/photos/6004239/pexels-photo-6004239.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    focus: {
      fr: "construire un plan HACCP utilisable par une petite entreprise alimentaire",
      de: "einen nutzbaren HACCP-Plan fuer einen kleinen Lebensmittelbetrieb aufbauen",
      pt: "criar um plano HACCP utilizavel para uma pequena empresa alimentar",
    },
    control: {
      fr: "decrire les etapes du procede, les dangers reels, les limites, la surveillance et les actions correctives sans transformer le dossier en bureaucratie",
      de: "Prozessschritte, reale Gefahren, Grenzwerte, Ueberwachung und Korrekturmassnahmen beschreiben, ohne den Plan zu buerokratisieren",
      pt: "descrever etapas do processo, perigos reais, limites, monitorizacao e acoes corretivas sem transformar o plano em burocracia",
    },
    title: {
      fr: "Comment creer un plan HACCP etape par etape pour une petite entreprise alimentaire",
      de: "HACCP-Plan Schritt fuer Schritt erstellen: Leitfaden fuer kleine Lebensmittelbetriebe",
      pt: "Como criar um plano HACCP passo a passo para uma pequena empresa alimentar",
    },
    excerpt: {
      fr: "Guide pratique pour creer un plan HACCP clair, adapte aux operations reelles, avec dangers, CCP, limites, surveillance, actions correctives et preuves attendues lors d'un controle.",
      de: "Praktischer Leitfaden fuer einen klaren HACCP-Plan mit realen Prozessschritten, Gefahrenanalyse, CCPs, Grenzwerten, Ueberwachung, Korrekturmassnahmen und pruefbaren Nachweisen.",
      pt: "Guia pratico para criar um plano HACCP claro, ligado as operacoes reais, com perigos, PCC, limites, monitorizacao, acoes corretivas e evidencias para auditoria.",
    },
  },
  {
    slug: "how-to-perform-a-hazard-analysis-correctly",
    category: "Fundamentals",
    image: "https://images.pexels.com/photos/35492405/pexels-photo-35492405.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    focus: {
      fr: "realiser une analyse des dangers HACCP qui resiste aux questions d'un auditeur",
      de: "eine HACCP-Gefahrenanalyse erstellen, die einer Pruefung standhaelt",
      pt: "fazer uma analise de perigos HACCP que resista a perguntas de auditoria",
    },
    control: {
      fr: "identifier les dangers biologiques, chimiques, physiques et allergenes par etape, puis justifier les controles retenus",
      de: "biologische, chemische, physikalische und Allergen-Gefahren je Prozessschritt identifizieren und Kontrollen begruenden",
      pt: "identificar perigos biologicos, quimicos, fisicos e alergeneos por etapa e justificar os controlos escolhidos",
    },
    title: {
      fr: "Comment realiser correctement une analyse des dangers HACCP",
      de: "HACCP-Gefahrenanalyse richtig durchfuehren",
      pt: "Como fazer corretamente uma analise de perigos HACCP",
    },
    excerpt: {
      fr: "Methode pratique pour analyser les dangers HACCP, eviter les justifications faibles et relier chaque decision aux controles, aux preuves et au fonctionnement du site.",
      de: "Praktische Methode fuer HACCP-Gefahrenanalysen: echte Gefahren erkennen, schwache Begruendungen vermeiden und Entscheidungen mit Kontrollen und Nachweisen verbinden.",
      pt: "Metodo pratico para analisar perigos HACCP, evitar justificacoes fracas e ligar cada decisao aos controlos, evidencias e operacao real do estabelecimento.",
    },
  },
  {
    slug: "identifying-critical-control-points-in-food-safety",
    category: "Fundamentals",
    image: "https://images.pexels.com/photos/5953502/pexels-photo-5953502.jpeg?auto=compress&cs=tinysrgb&w=1600&q=80",
    focus: {
      fr: "distinguer les vrais points critiques de controle des simples prerequis",
      de: "echte kritische Kontrollpunkte von normalen Basiskontrollen unterscheiden",
      pt: "distinguir pontos criticos de controlo reais de controlos pre-requisito",
    },
    control: {
      fr: "eviter de classer chaque etape comme CCP et documenter pourquoi une mesure suffit ou non",
      de: "vermeiden, jeden Schritt als CCP einzustufen, und dokumentieren, warum eine Massnahme ausreicht oder nicht",
      pt: "evitar transformar todas as etapas em PCC e documentar porque um controlo e ou nao suficiente",
    },
    title: {
      fr: "Identifier les points critiques de controle sans compliquer le HACCP",
      de: "Kritische Kontrollpunkte im HACCP erkennen, ohne den Plan zu ueberladen",
      pt: "Identificar pontos criticos de controlo sem complicar o HACCP",
    },
    excerpt: {
      fr: "Explication claire pour identifier les vrais CCP, separer les controles prerequis de la surveillance critique et garder le plan HACCP utilisable au quotidien.",
      de: "Klare Anleitung, um echte CCPs zu erkennen, Basiskontrollen von kritischer Ueberwachung zu trennen und den HACCP-Plan alltagstauglich zu halten.",
      pt: "Explicacao clara para identificar PCC reais, separar pre-requisitos de monitorizacao critica e manter o plano HACCP pratico no dia a dia.",
    },
  },
  {
    slug: "haccp-ccp-examples-uk-eu",
    category: "Compliance",
    image: "https://images.pexels.com/photos/6035331/pexels-photo-6035331.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    focus: {
      fr: "utiliser des exemples concrets de CCP pour mieux structurer un plan HACCP",
      de: "konkrete CCP-Beispiele nutzen, um einen HACCP-Plan besser zu strukturieren",
      pt: "usar exemplos concretos de PCC para estruturar melhor um plano HACCP",
    },
    control: {
      fr: "relier cuisson, refroidissement, maintien chaud, allergenes et remise en temperature a des limites et enregistrements clairs",
      de: "Garen, Abkuehlen, Warmhalten, Allergene und Wiedererhitzen mit klaren Grenzwerten und Aufzeichnungen verbinden",
      pt: "ligar cozedura, arrefecimento, manutencao quente, alergeneos e reaquecimento a limites e registos claros",
    },
    title: {
      fr: "Exemples de CCP HACCP pour les entreprises alimentaires",
      de: "HACCP-CCP-Beispiele fuer Lebensmittelbetriebe",
      pt: "Exemplos de PCC HACCP para empresas alimentares",
    },
    excerpt: {
      fr: "Exemples pratiques de points critiques de controle pour la cuisson, le refroidissement, le maintien chaud, les allergenes et les enregistrements HACCP.",
      de: "Praktische Beispiele fuer kritische Kontrollpunkte bei Garen, Abkuehlen, Warmhalten, Allergenen und HACCP-Aufzeichnungen.",
      pt: "Exemplos praticos de pontos criticos de controlo para cozedura, arrefecimento, manutencao quente, alergeneos e registos HACCP.",
    },
  },
  {
    slug: "temperature-control-in-haccp-limits-and-monitoring",
    category: "Compliance",
    image: "https://images.pexels.com/photos/6004155/pexels-photo-6004155.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    focus: {
      fr: "definir une surveillance des temperatures HACCP simple et defendable",
      de: "eine einfache und belastbare HACCP-Temperaturueberwachung festlegen",
      pt: "definir monitorizacao de temperaturas HACCP simples e defensavel",
    },
    control: {
      fr: "preciser les limites de cuisson, refroidissement, stockage, maintien chaud et correction en cas d'ecart",
      de: "Grenzwerte fuer Garen, Abkuehlen, Lagerung, Warmhalten und Korrekturen bei Abweichungen festlegen",
      pt: "definir limites para cozedura, arrefecimento, armazenamento, manutencao quente e correcao de desvios",
    },
    title: {
      fr: "Controle des temperatures en HACCP: limites, surveillance et registres",
      de: "Temperaturkontrolle im HACCP: Grenzwerte, Ueberwachung und Nachweise",
      pt: "Controlo de temperatura no HACCP: limites, monitorizacao e registos",
    },
    excerpt: {
      fr: "Guide pratique sur les limites de temperature, les controles de routine, les actions correctives et les registres necessaires dans un systeme HACCP.",
      de: "Praktischer Leitfaden zu Temperaturgrenzwerten, Routinekontrollen, Korrekturmassnahmen und Nachweisen in einem HACCP-System.",
      pt: "Guia pratico sobre limites de temperatura, controlos de rotina, acoes corretivas e registos necessarios num sistema HACCP.",
    },
  },
  {
    slug: "allergen-management-within-haccp-plans",
    category: "Compliance",
    image: "https://images.pexels.com/photos/5953835/pexels-photo-5953835.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    focus: {
      fr: "integrer la maitrise des allergenes dans le plan HACCP sans tout transformer en CCP",
      de: "Allergenmanagement in den HACCP-Plan integrieren, ohne alles zum CCP zu machen",
      pt: "integrar gestao de alergeneos no plano HACCP sem transformar tudo em PCC",
    },
    control: {
      fr: "maitriser ingredients, substitutions fournisseurs, contamination croisee, etiquetage et communication avec l'equipe",
      de: "Zutaten, Lieferantenwechsel, Kreuzkontakt, Kennzeichnung und Teamkommunikation beherrschen",
      pt: "controlar ingredientes, alteracoes de fornecedores, contacto cruzado, rotulagem e comunicacao da equipa",
    },
    title: {
      fr: "Comment integrer les allergenes dans un plan HACCP",
      de: "Allergenmanagement im HACCP-Plan richtig abbilden",
      pt: "Como integrar alergeneos num plano HACCP",
    },
    excerpt: {
      fr: "Approche pratique pour gerer les allergenes dans le HACCP: ingredients, contaminations croisees, changements de fournisseur, etiquetage et preuves.",
      de: "Praktischer Ansatz fuer Allergene im HACCP: Zutaten, Kreuzkontakt, Lieferantenwechsel, Kennzeichnung, Teamkommunikation und Nachweise.",
      pt: "Abordagem pratica para gerir alergeneos no HACCP: ingredientes, contacto cruzado, mudancas de fornecedor, rotulagem, comunicacao e evidencias.",
    },
  },
  {
    slug: "cooling-and-reheating-haccp-high-risk-steps",
    category: "Operations",
    image: "https://images.pexels.com/photos/35535653/pexels-photo-35535653.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    focus: {
      fr: "maitriser le refroidissement et la remise en temperature des aliments a risque",
      de: "Abkuehlen und Wiedererhitzen risikoreicher Lebensmittel sicher steuern",
      pt: "controlar arrefecimento e reaquecimento de alimentos de maior risco",
    },
    control: {
      fr: "documenter le temps, la temperature, les volumes, les contenants et les actions si le refroidissement est trop lent",
      de: "Zeit, Temperatur, Mengen, Behaelter und Massnahmen dokumentieren, wenn Abkuehlung zu langsam ist",
      pt: "documentar tempo, temperatura, volumes, recipientes e acoes quando o arrefecimento e lento",
    },
    title: {
      fr: "Refroidissement et remise en temperature: controles HACCP essentiels",
      de: "Abkuehlen und Wiedererhitzen: die wichtigsten HACCP-Kontrollen",
      pt: "Arrefecimento e reaquecimento: controlos HACCP essenciais",
    },
    excerpt: {
      fr: "Les controles HACCP essentiels pour refroidir et rechauffer les aliments a risque, avec limites pratiques, registres et actions correctives.",
      de: "Wichtige HACCP-Kontrollen fuer Abkuehlen und Wiedererhitzen risikoreicher Lebensmittel, mit Grenzwerten, Aufzeichnungen und Korrekturen.",
      pt: "Controlos HACCP essenciais para arrefecer e reaquecer alimentos de maior risco, com limites praticos, registos e acoes corretivas.",
    },
  },
  {
    slug: "haccp-monitoring-record-templates",
    category: "Compliance",
    image: "https://images.pexels.com/photos/112781/pexels-photo-112781.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    focus: {
      fr: "choisir des registres HACCP utiles plutot qu'une pile de formulaires inutilises",
      de: "nuetzliche HACCP-Aufzeichnungen statt ungenutzter Formularstapel waehlen",
      pt: "escolher registos HACCP uteis em vez de formularios que ninguem usa",
    },
    control: {
      fr: "relier chaque registre a un danger, une limite, une frequence, une responsabilite et une action corrective",
      de: "jede Aufzeichnung mit Gefahr, Grenzwert, Frequenz, Verantwortung und Korrekturmassnahme verbinden",
      pt: "ligar cada registo a perigo, limite, frequencia, responsabilidade e acao corretiva",
    },
    title: {
      fr: "Modeles de registres HACCP: quoi surveiller et quoi conserver",
      de: "HACCP-Aufzeichnungsvorlagen: was ueberwacht und aufbewahrt werden sollte",
      pt: "Modelos de registos HACCP: o que monitorizar e guardar",
    },
    excerpt: {
      fr: "Comment choisir et structurer les registres HACCP: temperatures, nettoyage, allergenes, actions correctives, verification et preuves d'audit.",
      de: "Wie HACCP-Aufzeichnungen strukturiert werden: Temperaturen, Reinigung, Allergene, Korrekturmassnahmen, Verifizierung und Auditnachweise.",
      pt: "Como escolher e estruturar registos HACCP: temperaturas, limpeza, alergeneos, acoes corretivas, verificacao e evidencias de auditoria.",
    },
  },
  {
    slug: "top-reasons-haccp-plans-fail-during-audits",
    category: "Compliance",
    image: "https://images.pexels.com/photos/5953751/pexels-photo-5953751.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    focus: {
      fr: "comprendre pourquoi les plans HACCP echouent pendant les audits",
      de: "verstehen, warum HACCP-Plaene in Audits scheitern",
      pt: "compreender porque planos HACCP falham em auditorias",
    },
    control: {
      fr: "corriger les plans copies, les diagrammes non verifies, les registres incomplets et les actions correctives faibles",
      de: "kopierte Plaene, ungepruefte Flussdiagramme, lueckenhafte Aufzeichnungen und schwache Korrekturmassnahmen verbessern",
      pt: "corrigir planos copiados, fluxogramas nao verificados, registos incompletos e acoes corretivas fracas",
    },
    title: {
      fr: "Pourquoi les plans HACCP echouent en audit et quoi corriger d'abord",
      de: "Warum HACCP-Plaene im Audit scheitern und was zuerst zu korrigieren ist",
      pt: "Porque os planos HACCP falham em auditoria e o que corrigir primeiro",
    },
    excerpt: {
      fr: "Les causes les plus frequentes d'echec HACCP en audit: plans generiques, surveillance faible, preuves absentes, actions correctives incompletes et mises a jour oubliees.",
      de: "Die haeufigsten Gruende fuer HACCP-Auditprobleme: generische Plaene, schwache Ueberwachung, fehlende Nachweise, unvollstaendige Korrekturen und veraltete Inhalte.",
      pt: "Principais razoes para falhas HACCP em auditoria: planos genericos, monitorizacao fraca, falta de evidencias, acoes corretivas incompletas e falta de atualizacao.",
    },
  },
  {
    slug: "haccp-vs-brcgs-vs-ifs",
    category: "Compliance",
    image: "https://images.pexels.com/photos/35479269/pexels-photo-35479269.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    focus: {
      fr: "comprendre la difference entre HACCP, BRCGS et IFS",
      de: "den Unterschied zwischen HACCP, BRCGS und IFS verstehen",
      pt: "compreender a diferenca entre HACCP, BRCGS e IFS",
    },
    control: {
      fr: "savoir ou s'arrete le systeme HACCP et ce que les referentiels de certification ajoutent en gouvernance et preuves",
      de: "verstehen, wo HACCP endet und was Zertifizierungsstandards bei Governance und Nachweisen ergaenzen",
      pt: "saber onde termina o HACCP e o que os referenciais de certificacao acrescentam em governanca e evidencias",
    },
    title: {
      fr: "HACCP, BRCGS et IFS: comprendre les differences",
      de: "HACCP, BRCGS und IFS: die Unterschiede verstehen",
      pt: "HACCP, BRCGS e IFS: compreender as diferencas",
    },
    excerpt: {
      fr: "Comparaison pratique entre HACCP, BRCGS et IFS: objectifs, exigences, preuves attendues et moment ou une entreprise doit penser a la certification.",
      de: "Praktischer Vergleich von HACCP, BRCGS und IFS: Ziele, Anforderungen, Nachweise und wann ein Betrieb ueber Zertifizierung nachdenken sollte.",
      pt: "Comparacao pratica entre HACCP, BRCGS e IFS: objetivos, requisitos, evidencias esperadas e quando uma empresa deve considerar certificacao.",
    },
  },
];

const localeCopy = {
  fr: {
    intro: "Cette page est concue pour les exploitants alimentaires qui veulent un resultat utilisable sur site, pas seulement un document a archiver.",
    focusLead: "Le sujet central est de",
    workLead: "Le travail consiste a",
    workTail: "Le contenu doit rester assez simple pour etre applique par l'equipe, mais assez precis pour etre defendable lors d'un controle ou d'un audit.",
    objective: "Objectif pratique",
    nextStep: "Prochaine etape",
    sections: [
      ["Ce que le controle doit prouver", "Le dossier doit montrer que l'equipe connait le procede, les dangers importants et les preuves qui confirment la maitrise. Un bon contenu HACCP relie toujours la decision au travail reel: reception, stockage, preparation, cuisson, refroidissement, service, nettoyage et verification."],
      ["Comment l'appliquer", "Commencez par decrire le flux reel, puis ajoutez les controles qui changent vraiment le risque. Notez qui verifie, a quelle frequence, avec quelle limite et quelle action est prise si le resultat n'est pas acceptable."],
      ["Erreurs frequentes", "Les faiblesses les plus courantes sont les plans copies, les limites sans justification, les registres remplis sans verification et les actions correctives qui ne prouvent pas le retour a la maitrise."],
      ["Preuves a conserver", "Conservez les fiches de surveillance, les corrections, les signatures de verification, les mises a jour de recettes ou fournisseurs et toute preuve montrant que le systeme est vivant."],
    ],
    cta: "PinkPepper peut transformer ces points en documents, registres et controles plus faciles a tenir a jour.",
  },
  de: {
    intro: "Diese Seite ist fuer Lebensmittelbetriebe gedacht, die ein im Alltag nutzbares Ergebnis brauchen und nicht nur ein Dokument fuer den Ordner.",
    focusLead: "Der Schwerpunkt ist:",
    workLead: "Die Aufgabe ist,",
    workTail: "Der Inhalt muss einfach genug fuer den Alltag bleiben, aber praezise genug sein, um ihn bei Kontrolle oder Audit zu begruenden.",
    objective: "Praktisches Ziel",
    nextStep: "Naechster Schritt",
    sections: [
      ["Was die Kontrolle belegen muss", "Die Unterlagen muessen zeigen, dass das Team den Prozess, die wesentlichen Gefahren und die Nachweise zur Beherrschung versteht. Gute HACCP-Inhalte verbinden jede Entscheidung mit der realen Arbeit: Wareneingang, Lagerung, Vorbereitung, Garen, Abkuehlen, Service, Reinigung und Verifizierung."],
      ["So wird es angewendet", "Beschreiben Sie zuerst den tatsaechlichen Prozessfluss und ergaenzen Sie dann nur die Kontrollen, die das Risiko wirklich beeinflussen. Halten Sie fest, wer prueft, wie oft, mit welchem Grenzwert und welche Massnahme bei Abweichung folgt."],
      ["Haeufige Fehler", "Typische Schwachstellen sind kopierte Plaene, unbegruendete Grenzwerte, Aufzeichnungen ohne Verifizierung und Korrekturmassnahmen, die nicht zeigen, dass die Kontrolle wiederhergestellt wurde."],
      ["Welche Nachweise wichtig sind", "Bewahren Sie Ueberwachungsprotokolle, Korrekturen, Verifizierungssignaturen, Rezept- oder Lieferantenaenderungen und alle Nachweise auf, dass das System aktiv gepflegt wird."],
    ],
    cta: "PinkPepper hilft, diese Punkte in klarere Dokumente, Aufzeichnungen und laufende Kontrollen zu uebersetzen.",
  },
  pt: {
    intro: "Esta pagina foi pensada para operadores alimentares que precisam de um resultado utilizavel no dia a dia, nao apenas de um documento para arquivo.",
    focusLead: "O tema central e",
    workLead: "O trabalho consiste em",
    workTail: "O conteudo deve ser simples o suficiente para a equipa aplicar, mas preciso o suficiente para defender numa inspecao ou auditoria.",
    objective: "Objetivo pratico",
    nextStep: "Proximo passo",
    sections: [
      ["O que o controlo deve provar", "A documentacao deve mostrar que a equipa conhece o processo, os perigos importantes e as evidencias que demonstram controlo. Um bom conteudo HACCP liga sempre a decisao ao trabalho real: rececao, armazenamento, preparacao, confeccao, arrefecimento, servico, limpeza e verificacao."],
      ["Como aplicar", "Comece por descrever o fluxo real do processo e adicione apenas os controlos que mudam efetivamente o risco. Registe quem verifica, com que frequencia, qual o limite e que acao e tomada quando o resultado nao e aceitavel."],
      ["Erros frequentes", "As falhas mais comuns sao planos copiados, limites sem justificacao, registos preenchidos sem verificacao e acoes corretivas que nao provam o regresso ao controlo."],
      ["Evidencias a guardar", "Guarde registos de monitorizacao, correcoes, assinaturas de verificacao, alteracoes de receitas ou fornecedores e qualquer evidencia de que o sistema esta vivo."],
    ],
    cta: "O PinkPepper ajuda a transformar estes pontos em documentos, registos e controlos mais faceis de manter atualizados.",
  },
};

const contentRoot = path.join(process.cwd(), "content", "articles");
const diacritics = {
  fr: [
    ["creer", "créer"], ["etape", "étape"], ["etapes", "étapes"], ["adapte", "adapté"],
    ["operations", "opérations"], ["reelles", "réelles"], ["reel", "réel"], ["controle", "contrôle"],
    ["controles", "contrôles"], ["concue", "conçue"], ["resultat", "résultat"], ["decrire", "décrire"],
    ["procede", "procédé"], ["reels", "réels"], ["etre", "être"], ["applique", "appliqué"],
    ["equipe", "équipe"], ["precis", "précis"], ["defendable", "défendable"], ["connait", "connaît"],
    ["maitrise", "maîtrise"], ["decision", "décision"], ["reception", "réception"],
    ["preparation", "préparation"], ["verification", "vérification"], ["verifie", "vérifie"],
    ["frequence", "fréquence"], ["frequentes", "fréquentes"], ["copies", "copiés"],
    ["mises a jour", "mises à jour"], ["systeme", "système"], ["Prochaine etape", "Prochaine étape"],
    ["a archiver", "à archiver"], ["consiste a", "consiste à"], ["l'equipe", "l'équipe"],
  ],
  de: [
    ["fuer", "für"], ["Ueberwachung", "Überwachung"], ["ueber", "über"], ["Abkuehlen", "Abkühlen"],
    ["Korrekturmassnahmen", "Korrekturmaßnahmen"], ["Massnahme", "Maßnahme"], ["Haeufige", "Häufige"],
    ["Plaene", "Pläne"], ["Pruefung", "Prüfung"], ["prueft", "prüft"], ["haelt", "hält"],
    ["tatsaechlichen", "tatsächlichen"], ["ergaenzen", "ergänzen"], ["Naechster", "Nächster"],
    ["Aenderungen", "Änderungen"], ["Lieferantenaenderungen", "Lieferantenänderungen"],
    ["Ueberwachungsprotokolle", "Überwachungsprotokolle"], ["lueckenhafte", "lückenhafte"],
    ["erwaermen", "erwärmen"], ["waehlen", "wählen"], ["buerokratisieren", "bürokratisieren"],
    ["praezise", "präzise"], ["pruefbaren", "prüfbaren"], ["begruenden", "begründen"],
  ],
  pt: [
    ["pagina", "página"], ["utilizavel", "utilizável"], ["nao", "não"], ["acao", "ação"],
    ["acoes", "ações"], ["pratico", "prático"], ["Objetivo pratico", "Objetivo prático"],
    ["Proximo", "Próximo"], ["rececao", "receção"], ["preparacao", "preparação"],
    ["confeccao", "confeção"], ["servico", "serviço"], ["verificacao", "verificação"],
    ["frequencia", "frequência"], ["correcao", "correção"], ["evidencias", "evidências"],
    ["monitorizacao", "monitorização"], ["alergeneos", "alergénios"], ["quimicos", "químicos"],
    ["fisicos", "físicos"], ["biologicos", "biológicos"], ["criticos", "críticos"],
    ["critico", "crítico"], ["analise", "análise"], ["perigos", "perigos"], ["esta vivo", "está vivo"],
    ["O tema central e", "O tema central é"], ["conteudo", "conteúdo"], ["inspecao", "inspeção"],
    ["ligado as", "ligado às"], ["decisao", "decisão"], ["atualizacao", "atualização"],
  ],
};

function applyDiacritics(locale, value) {
  const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  return diacritics[locale].reduce(
    (current, [from, to]) => {
      if (/^[A-Za-z]+$/.test(from)) {
        return current.replace(new RegExp(`\\b${escapeRegex(from)}\\b`, "g"), to);
      }

      return current.replaceAll(from, to);
    },
    value,
  );
}

for (const locale of ["fr", "de", "pt"]) {
  const localeDir = path.join(contentRoot, locale);
  mkdirSync(localeDir, { recursive: true });

  const manifest = articles.map((article, index) => ({
    title: applyDiacritics(locale, article.title[locale]),
    slug: article.slug,
    excerpt: applyDiacritics(locale, article.excerpt[locale]),
    category: article.category,
    publishedAt: `2026-04-${String(22 - index).padStart(2, "0")}`,
    image: article.image,
    source: "pinkpepper-localized",
  }));

  writeFileSync(path.join(localeDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  for (const article of articles) {
    const copy = localeCopy[locale];
    const body = applyDiacritics(locale, [
      `<p>${copy.intro} ${copy.focusLead} ${article.focus[locale]}.</p>`,
      `<h2>${copy.objective}</h2>`,
      `<p>${copy.workLead} ${article.control[locale]}. ${copy.workTail}</p>`,
      ...copy.sections.flatMap(([heading, paragraph]) => [`<h2>${heading}</h2>`, `<p>${paragraph}</p>`]),
      `<h2>${copy.nextStep}</h2>`,
      `<p>${copy.cta}</p>`,
    ].join("\n\n"));
    const localizedTitle = applyDiacritics(locale, article.title[locale]);
    const localizedExcerpt = applyDiacritics(locale, article.excerpt[locale]);

    const frontmatter = [
      "---",
      `title: "${localizedTitle}"`,
      `slug: "${article.slug}"`,
      `excerpt: "${localizedExcerpt}"`,
      `category: "${article.category}"`,
      `publishedAt: "${manifest.find((item) => item.slug === article.slug).publishedAt}"`,
      `image: "${article.image}"`,
      `source: "pinkpepper-localized"`,
      "---",
      body,
      "",
    ].join("\n");

    writeFileSync(path.join(localeDir, `${article.slug}.md`), frontmatter, "utf8");
  }
}
