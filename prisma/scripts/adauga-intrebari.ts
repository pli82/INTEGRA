import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type Intrebare = {
  enunt: string;
  optiuni: { text: string; corecta: boolean }[];
};

const INTREBARI_PE_CURS: Record<string, Intrebare[]> = {
  "Integritate și prevenirea mitei": [
    {
      enunt: "Care este elementul esențial care diferențiază mita de un cadou obișnuit?",
      optiuni: [
        { text: "Existența unei contrapartide/influențe asupra unei decizii oficiale", corecta: true },
        { text: "Valoarea monetară a obiectului oferit", corecta: false },
        { text: "Momentul din an în care este oferit", corecta: false },
        { text: "Ambalajul în care este oferit", corecta: false },
      ],
    },
    {
      enunt: "Un funcționar primește o invitație la o cină din partea unei firme cu care are relații contractuale. Ce ar trebui să facă?",
      optiuni: [
        { text: "Să declare invitația conform procedurilor interne de integritate", corecta: true },
        { text: "Să accepte fără să anunțe pe nimeni", corecta: false },
        { text: "Să refuze automat orice interacțiune cu firma", corecta: false },
        { text: "Să ceară un cadou în schimb", corecta: false },
      ],
    },
    {
      enunt: "Conflictul de interese apare atunci când:",
      optiuni: [
        { text: "Interesul personal poate influența îndeplinirea obiectivă a atribuțiilor de serviciu", corecta: true },
        { text: "Un angajat lucrează ore suplimentare", corecta: false },
        { text: "Doi colegi au opinii diferite", corecta: false },
        { text: "Se schimbă structura organizatorică", corecta: false },
      ],
    },
    {
      enunt: "Care dintre următoarele este un exemplu de conflict de interese?",
      optiuni: [
        { text: "Un funcționar evaluează oferta unei firme deținute de o rudă apropiată", corecta: true },
        { text: "Un funcționar participă la un curs de formare", corecta: false },
        { text: "Un funcționar solicită concediu", corecta: false },
        { text: "Un funcționar redactează un raport intern", corecta: false },
      ],
    },
    {
      enunt: "Ce prevede, în general, un cod de conduită privind cadourile primite în exercitarea funcției?",
      optiuni: [
        { text: "Impune declararea și, peste un anumit prag valoric, predarea cadourilor", corecta: true },
        { text: "Interzice orice fel de interacțiune socială cu partenerii", corecta: false },
        { text: "Permite păstrarea necondiționată a oricărui cadou", corecta: false },
        { text: "Nu se aplică personalului de conducere", corecta: false },
      ],
    },
    {
      enunt: "De ce este importantă raportarea promptă a tentativelor de mituire?",
      optiuni: [
        { text: "Permite instituției să ia măsuri și să protejeze integritatea procesului decizional", corecta: true },
        { text: "Este o obligație fără nicio consecință practică", corecta: false },
        { text: "Ajută doar la statistici interne", corecta: false },
        { text: "Nu are legătură cu prevenirea corupției", corecta: false },
      ],
    },
    {
      enunt: "Studiile de caz din administrația publică sunt folosite în instruire mai ales pentru a:",
      optiuni: [
        { text: "Ilustra situații reale și modul corect de reacție", corecta: true },
        { text: "Înlocui prevederile legale", corecta: false },
        { text: "Stabili sancțiuni disciplinare", corecta: false },
        { text: "Genera statistici de personal", corecta: false },
      ],
    },
    {
      enunt: "Care este rolul principal al principiilor de integritate într-o instituție publică?",
      optiuni: [
        { text: "Ghidarea comportamentului etic și prevenirea abuzurilor de putere", corecta: true },
        { text: "Creșterea numărului de angajați", corecta: false },
        { text: "Reducerea programului de lucru", corecta: false },
        { text: "Simplificarea organigramei", corecta: false },
      ],
    },
    {
      enunt: "Ce ar trebui să facă un angajat care suspectează o faptă de corupție a unui coleg?",
      optiuni: [
        { text: "Să sesizeze canalele interne de integritate sau persoana desemnată", corecta: true },
        { text: "Să ignore situația", corecta: false },
        { text: "Să rezolve personal problema cu colegul", corecta: false },
        { text: "Să discute public despre suspiciune", corecta: false },
      ],
    },
    {
      enunt: "Recapitulând, prevenirea mitei se bazează în primul rând pe:",
      optiuni: [
        { text: "Transparență, reguli clare și raportare responsabilă", corecta: true },
        { text: "Lipsa oricăror reguli scrise", corecta: false },
        { text: "Decizii discreționare, fără proceduri", corecta: false },
        { text: "Evitarea oricărei instruiri a personalului", corecta: false },
      ],
    },
  ],
  "Sistemul de management anti-mită": [
    {
      enunt: "Ce este ISO 37001?",
      optiuni: [
        { text: "Un standard internațional pentru sisteme de management anti-mită", corecta: true },
        { text: "O lege românească privind achizițiile publice", corecta: false },
        { text: "Un regulament UE privind protecția datelor", corecta: false },
        { text: "Un standard de calitate ISO 9001", corecta: false },
      ],
    },
    {
      enunt: "Cine este responsabil, de regulă, de supravegherea funcționării SMAM într-o organizație?",
      optiuni: [
        { text: "O funcție de conformitate/responsabil anti-mită desemnat, cu acces la conducere", corecta: true },
        { text: "Fiecare angajat, fără nicio coordonare", corecta: false },
        { text: "Doar auditorul extern, o dată la 5 ani", corecta: false },
        { text: "Departamentul de resurse umane, exclusiv", corecta: false },
      ],
    },
    {
      enunt: "Evaluarea riscurilor de mită presupune, în principal:",
      optiuni: [
        { text: "Identificarea proceselor și relațiilor expuse riscului de mituire", corecta: true },
        { text: "Calculul bugetului anual al instituției", corecta: false },
        { text: "Evaluarea performanței individuale a angajaților", corecta: false },
        { text: "Actualizarea organigramei", corecta: false },
      ],
    },
    {
      enunt: 'Un exemplu tipic de "control anti-mită" este:',
      optiuni: [
        { text: "Verificarea terților (due diligence) înainte de contractare", corecta: true },
        { text: "Reducerea numărului de vacanțe", corecta: false },
        { text: "Extinderea programului de lucru", corecta: false },
        { text: "Simplificarea site-ului instituției", corecta: false },
      ],
    },
    {
      enunt: "De ce este necesară monitorizarea periodică a SMAM?",
      optiuni: [
        { text: "Pentru a identifica din timp deficiențele și a îmbunătăți sistemul", corecta: true },
        { text: "Pentru a justifica cheltuieli suplimentare", corecta: false },
        { text: "Este opțională și fără impact practic", corecta: false },
        { text: "Se face o singură dată, la implementare", corecta: false },
      ],
    },
    {
      enunt: "Rolurile și responsabilitățile în cadrul SMAM trebuie să fie:",
      optiuni: [
        { text: "Clar definite și comunicate în cadrul organizației", corecta: true },
        { text: "Lăsate la latitudinea fiecărui angajat", corecta: false },
        { text: "Ținute confidențiale față de personal", corecta: false },
        { text: "Identice pentru toate funcțiile din instituție", corecta: false },
      ],
    },
    {
      enunt: "Care este scopul principal al unui sistem de management anti-mită?",
      optiuni: [
        { text: "Prevenirea, detectarea și abordarea faptelor de mituire", corecta: true },
        { text: "Creșterea profitului pe termen scurt", corecta: false },
        { text: "Reducerea personalului", corecta: false },
        { text: "Simplificarea achizițiilor publice fără verificări", corecta: false },
      ],
    },
    {
      enunt: "Controalele anti-mită se aplică, de regulă:",
      optiuni: [
        { text: "Proceselor cu risc ridicat, precum achizițiile și relațiile cu terții", corecta: true },
        { text: "Doar activităților administrative interne", corecta: false },
        { text: "Exclusiv comunicării externe", corecta: false },
        { text: "Doar personalului nou-angajat", corecta: false },
      ],
    },
    {
      enunt: "Certificarea ISO 37001 oferă, în primul rând:",
      optiuni: [
        { text: "O asigurare rezonabilă privind existența unor măsuri anti-mită adecvate", corecta: true },
        { text: "Garanția absolută a inexistenței corupției", corecta: false },
        { text: "Scutirea de răspundere legală", corecta: false },
        { text: "Reducerea automată a taxelor", corecta: false },
      ],
    },
    {
      enunt: "Îmbunătățirea continuă a SMAM se realizează prin:",
      optiuni: [
        { text: "Analiza rezultatelor monitorizării și actualizarea măsurilor", corecta: true },
        { text: "Menținerea neschimbată a procedurilor, indiferent de rezultate", corecta: false },
        { text: "Eliminarea auditurilor interne", corecta: false },
        { text: "Reducerea instruirii personalului", corecta: false },
      ],
    },
  ],
  "Raportarea incidentelor": [
    {
      enunt: "Care este scopul principal al canalelor interne de raportare?",
      optiuni: [
        { text: "Să permită semnalarea în siguranță a suspiciunilor de mituire sau corupție", corecta: true },
        { text: "Să colecteze feedback despre cantina instituției", corecta: false },
        { text: "Să gestioneze cererile de concediu", corecta: false },
        { text: "Să înlocuiască evaluarea anuală de performanță", corecta: false },
      ],
    },
    {
      enunt: "Protecția avertizorilor de integritate presupune, în principal:",
      optiuni: [
        { text: "Interzicerea represaliilor împotriva persoanei care raportează cu bună-credință", corecta: true },
        { text: "Obligativitatea dezvăluirii publice a identității raportorului", corecta: false },
        { text: "Recompense financiare garantate", corecta: false },
        { text: "Lipsa oricărei proceduri de confidențialitate", corecta: false },
      ],
    },
    {
      enunt: "La documentarea unui incident de integritate, este esențial să se rețină:",
      optiuni: [
        { text: "Fapte concrete, date, persoane implicate și dovezi disponibile", corecta: true },
        { text: "Doar impresii personale, fără detalii", corecta: false },
        { text: "Numele tuturor colegilor din departament", corecta: false },
        { text: "Opinii nefondate despre caracterul persoanei suspectate", corecta: false },
      ],
    },
    {
      enunt: "Dacă o persoană raportează cu bună-credință, dar informația se dovedește ulterior incorectă, aceasta:",
      optiuni: [
        { text: "Este în general protejată, atât timp cât a acționat cu bună-credință", corecta: true },
        { text: "Este automat sancționată disciplinar", corecta: false },
        { text: "Pierde dreptul la orice protecție legală", corecta: false },
        { text: "Trebuie să demisioneze", corecta: false },
      ],
    },
    {
      enunt: "Un canal de raportare eficient ar trebui să fie, în primul rând:",
      optiuni: [
        { text: "Accesibil, confidențial și cunoscut de toți angajații", corecta: true },
        { text: "Disponibil doar conducerii de vârf", corecta: false },
        { text: "Complicat, pentru a descuraja raportările nefondate", corecta: false },
        { text: "Anunțat o singură dată, la angajare", corecta: false },
      ],
    },
    {
      enunt: "Ce se întâmplă, de regulă, după înregistrarea unei sesizări de integritate?",
      optiuni: [
        { text: "Se declanșează o verificare/analiză preliminară a faptelor semnalate", corecta: true },
        { text: "Sesizarea este ștearsă automat după 24 de ore", corecta: false },
        { text: "Nu se întreprinde nicio acțiune", corecta: false },
        { text: "Se face publică imediat identitatea celui reclamat", corecta: false },
      ],
    },
    {
      enunt: "Studiul de caz privind raportarea are ca scop principal:",
      optiuni: [
        { text: "Exersarea modului corect de identificare și semnalare a unui incident", corecta: true },
        { text: "Evaluarea abilităților de scriere creativă", corecta: false },
        { text: "Testarea cunoștințelor de contabilitate", corecta: false },
        { text: "Verificarea prezenței la curs", corecta: false },
      ],
    },
    {
      enunt: "Care dintre următoarele NU ar trebui să descurajeze o persoană să raporteze un incident?",
      optiuni: [
        { text: "Teama de represalii, având în vedere protecțiile legale existente", corecta: true },
        { text: "Lipsa oricărei dovezi, chiar și indirecte", corecta: false },
        { text: "Faptul că fapta ar fi minoră", corecta: false },
        { text: "Faptul că persoana implicată este un superior ierarhic", corecta: false },
      ],
    },
    {
      enunt: "Confidențialitatea în procesul de raportare are rolul de a:",
      optiuni: [
        { text: "Proteja identitatea raportorului și integritatea investigației", corecta: true },
        { text: "Ascunde rezultatele investigației de conducere", corecta: false },
        { text: "Elimina orice urmă a sesizării", corecta: false },
        { text: "Îngreuna comunicarea internă", corecta: false },
      ],
    },
    {
      enunt: "În final, un sistem funcțional de raportare a incidentelor contribuie la:",
      optiuni: [
        { text: "Detectarea timpurie a problemelor de integritate și consolidarea încrederii instituționale", corecta: true },
        { text: "Creșterea birocrației fără beneficii", corecta: false },
        { text: "Scăderea productivității personalului", corecta: false },
        { text: "Eliminarea necesității altor controale interne", corecta: false },
      ],
    },
  ],
};

async function main() {
  const cursuri = await prisma.curs.findMany();

  for (const curs of cursuri) {
    const intrebariCurs = INTREBARI_PE_CURS[curs.titlu];
    if (!intrebariCurs) {
      console.log(`— Nu am întrebări definite pentru „${curs.titlu}", sar peste.`);
      continue;
    }

    const existente = await prisma.intrebare.count({ where: { cursId: curs.id } });
    if (existente > 0) {
      console.log(`— „${curs.titlu}" are deja ${existente} întrebări, sar peste.`);
      continue;
    }

    for (let i = 0; i < intrebariCurs.length; i++) {
      const q = intrebariCurs[i];
      await prisma.intrebare.create({
        data: {
          cursId: curs.id,
          enunt: q.enunt,
          ordine: i + 1,
          optiuni: { create: q.optiuni },
        },
      });
    }
    console.log(`✓ Adăugate ${intrebariCurs.length} întrebări la cursul „${curs.titlu}"`);
  }

  console.log("Gata.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => process.exit(0));