"use client";

import type * as React from "react";

import {
  Block,
  Bullets,
  Cols,
  Examples,
  Formula,
  GTable,
  Note,
  P,
  Section,
} from "./grammar-ui";

export type GrammarSection = {
  id: string;
  label: string;
  hint: string;
  render: () => React.ReactNode;
};

const CASES = () => (
  <Section
    title="Padeži"
    lead="Nemački ima četiri padeža. Sama imenica se skoro nikad ne menja, menja se član i pridev ispred nje. Zato je ovo prva tabela koju vredi znati napamet."
  >
    <Block title="Šta koji padež radi">
      <GTable
        wrap
        head={["Padež", "Pitanje", "Uloga", "Primer", "srpski"]}
        rows={[
          [
            "Nominativ",
            "wer? was?",
            "subjekat, ko vrši radnju",
            "*Der Mann* liest.",
            "Čovek čita.",
          ],
          [
            "Akkusativ",
            "wen? was?",
            "direktni objekat, koga ili šta",
            "Ich sehe *den Mann*.",
            "Vidim čoveka.",
          ],
          [
            "Dativ",
            "wem?",
            "indirektni objekat, kome",
            "Ich helfe *dem Mann*.",
            "Pomažem čoveku.",
          ],
          [
            "Genitiv",
            "wessen?",
            "pripadnost, čije",
            "Das Auto *des Mannes*.",
            "Čovekov auto.",
          ],
        ]}
      />
    </Block>

    <Cols>
      <Block title="Određeni član: der, die, das">
        <GTable
          head={["", "muški", "ženski", "srednji", "množina"]}
          rows={[
            ["Nominativ", "der", "die", "das", "die"],
            ["Akkusativ", "*den*", "die", "das", "die"],
            ["Dativ", "*dem*", "*der*", "*dem*", "*den* + n"],
            ["Genitiv", "*des* + s", "*der*", "*des* + s", "*der*"],
          ]}
        />
      </Block>

      <Block title="Neodređeni član i kein / mein">
        <GTable
          head={["", "muški", "ženski", "srednji", "množina"]}
          rows={[
            ["Nominativ", "ein", "eine", "ein", "kein*e*"],
            ["Akkusativ", "ein*en*", "eine", "ein", "kein*e*"],
            ["Dativ", "ein*em*", "ein*er*", "ein*em*", "kein*en* + n"],
            ["Genitiv", "ein*es*", "ein*er*", "ein*es*", "kein*er*"],
          ]}
        />
      </Block>
    </Cols>

    <Note title="Zapamti" tone="remember">
      Sve prisvojne zamenice (mein, dein, sein, ihr, unser, euer, Ihr) i kein
      menjaju se tačno kao ein. Razlika je samo u množini: ein nema množinu, a
      kein- i mein- imaju.
    </Note>

    <Block title="Lične zamenice kroz padeže">
      <GTable
        wrap
        head={[
          "Nominativ",
          "srpski",
          "Akkusativ",
          "srpski",
          "Dativ",
          "srpski",
        ]}
        rows={[
          ["ich", "ja", "mich", "mene", "mir", "meni"],
          ["du", "ti", "dich", "tebe", "dir", "tebi"],
          ["er", "on", "ihn", "njega", "ihm", "njemu"],
          ["sie", "ona", "sie", "nju", "ihr", "njoj"],
          ["es", "ono", "es", "njega", "ihm", "njemu"],
          ["wir", "mi", "uns", "nas", "uns", "nama"],
          ["ihr", "vi", "euch", "vas", "euch", "vama"],
          ["sie", "oni", "sie", "njih", "ihnen", "njima"],
          ["Sie", "Vi (učtivo)", "Sie", "Vas", "Ihnen", "Vama"],
        ]}
      />
    </Block>

    <Block title="Kako da znaš koji padež ide">
      <Bullets
        items={[
          "*Glagol* traži padež: sehen + Akkusativ, helfen + Dativ. To se uči uz glagol.",
          "*Predlog* traži padež: für + Akkusativ, mit + Dativ, wegen + Genitiv.",
          "*Wechselpräposition* zavisi od pitanja: wohin? → Akkusativ (kretanje), wo? → Dativ (mesto).",
          "*Trajanje i vreme bez predloga* ide u Akkusativ: jeden Tag, letzten Montag, einen Monat lang.",
        ]}
      />
    </Block>

    <Cols>
      <Block title="Glagoli koji traže dativ">
        <P>
          Ovih ima malo i vredi ih naučiti kao spisak, jer je Akkusativ inače
          podrazumevan.
        </P>
        <GTable
          wrap
          head={["Glagol", "srpski", "Glagol", "srpski"]}
          rows={[
            ["helfen", "pomagati", "gefallen", "dopadati se"],
            ["danken", "zahvaljivati", "schmecken", "prijati (o ukusu)"],
            ["gratulieren", "čestitati", "passen", "pristajati (veličinom)"],
            ["antworten", "odgovoriti (nekome)", "gehören", "pripadati"],
            ["zuhören", "slušati", "folgen", "slediti"],
            ["vertrauen", "imati poverenja u", "begegnen", "sresti"],
            ["fehlen", "nedostajati", "wehtun", "boleti"],
            ["ähneln", "ličiti na", "gelingen", "uspevati"],
          ]}
        />
        <Examples
          items={[
            ["Ich helfe *meinem Bruder*.", "Pomažem svom bratu."],
            ["Das Kleid gefällt *mir*.", "Haljina mi se dopada."],
            ["Der Hut gehört *dem Mann*.", "Šešir pripada tom čoveku."],
          ]}
        />
      </Block>

      <Block title="Glagoli sa dva objekta">
        <P>
          Ovi glagoli traže dva objekta odjednom, i red je skoro uvek isti:
          prvo kome, pa šta.
        </P>
        <GTable
          wrap
          head={["Glagol", "srpski", "Glagol", "srpski"]}
          rows={[
            ["geben", "dati", "schicken", "poslati"],
            ["schenken", "pokloniti", "bringen", "doneti"],
            ["zeigen", "pokazati", "leihen", "pozajmiti"],
            ["erklären", "objasniti", "anbieten", "ponuditi"],
            ["empfehlen", "preporučiti", "erzählen", "ispričati"],
          ]}
        />
        <Formula>Subjekat + glagol + *Dativ (kome)* + *Akkusativ (šta)*</Formula>
        <Examples
          items={[
            ["Ich gebe *dem Kind* *das Buch*.", "Dajem detetu knjigu."],
            ["Er zeigt *mir* *die Fotos*.", "On mi pokazuje fotografije."],
          ]}
        />
        <Note title="Pazi na redosled" tone="trap">
          Ako je objekat zamenica, zamenica ide ispred imenice, a dve zamenice
          idu obrnutim redom: Ich gebe *es* dem Kind. → Ich gebe *es ihm*.
        </Note>
      </Block>
    </Cols>

    <Block title="Genitiv u praksi">
      <P>
        Muški i srednji rod dobijaju *-s* ili *-es* na kraju imenice: des
        Mannes, des Autos, des Kindes. Ženski rod i množina ne dobijaju ništa.
      </P>
      <Examples
        items={[
          ["Das ist das Auto *des Lehrers*.", "To je nastavnikov auto."],
          ["Die Farbe *der Wand* gefällt mir.", "Dopada mi se boja zida."],
          [
            "Das ist das Auto *von meinem Bruder*.",
            "To je auto mog brata.",
            "govorni jezik",
          ],
        ]}
      />
      <Note title="U govoru" tone="tip">
        U svakodnevnom govoru Genitiv se često zamenjuje sa *von + Dativ*. U
        pisanju, na ispitu i posle predloga (wegen, während, trotz) drži se
        Genitiva.
      </Note>
    </Block>
  </Section>
);

const NOUNS = () => (
  <Section
    title="Imenice i rod"
    lead="Rod se u nemačkom ne oseća, uči se uz reč. Ali imenice sa prepoznatljivim nastavkom skoro uvek poštuju pravilo, pa se kod njih rod može pogoditi."
  >
    <Block title="Rod po nastavku">
      <P>
        Nastavci se najlakše pamte kao tri niza. Ko zna ova tri reda, pogodi rod
        većine imenica koje uopšte imaju nastavak.
      </P>
      <GTable
        wrap
        head={["Rod", "Nastavci napamet"]}
        rows={[
          ["*der* (muški)", "ig · ling · or · ismus · er"],
          ["*das* (srednji)", "tum · chen · ma · ment · um · lein · nis"],
          [
            "*die* (ženski)",
            "heit · ung · keit · ei · schaft · ion · ie · tät · ik · ur · e",
          ],
        ]}
      />
      <GTable
        wrap
        head={["Rod", "Primeri", "srpski"]}
        rows={[
          [
            "*der*",
            "der Hon*ig*, der Lehr*ling*, der Mot*or*, der Real*ismus*, der Lehr*er*",
            "med, šegrt, motor, realizam, nastavnik",
          ],
          [
            "*das*",
            "das Eigen*tum*, das Mäd*chen*, das The*ma*, das Doku*ment*, das Dat*um*, das Fräu*lein*, das Ergeb*nis*",
            "vlasništvo, devojčica, tema, dokument, datum, gospođica, rezultat",
          ],
          [
            "*die*",
            "die Frei*heit*, die Zeit*ung*, die Möglich*keit*, die Bäcker*ei*, die Freund*schaft*, die Nat*ion*, die Energ*ie*, die Universi*tät*, die Mus*ik*, die Nat*ur*, die Blum*e*",
            "sloboda, novine, mogućnost, pekara, prijateljstvo, nacija, energija, univerzitet, muzika, priroda, cvet",
          ],
        ]}
      />
      <Cols>
        <Note title="Bez nastavka" tone="tip">
          Kad nastavka nema, pomaže značenje. *der*: dani, meseci, godišnja
          doba, vremenske pojave, strane sveta, alkohol, marke auta. *das*:
          infinitivi kao imenice, slova, boje, jezici, reči sa Ge-. *die*:
          brojevi kao imenice.
        </Note>
        <Note title="Pazi" tone="warn">
          Deminutivi na -chen i -lein su uvek srednji rod, bez obzira na osobu:
          *das* Mädchen, *das* Fräulein, *das* Brötchen. Kod -nis ima i ženskih
          izuzetaka: *die* Kenntnis, *die* Erlaubnis.
        </Note>
        <Note title="U Austriji" tone="austria">
          Deminutiv se pravi nastavkom *-erl*, i takođe je srednjeg roda: *das*
          Sackerl, *das* Packerl, *das* Hunderl. Nekoliko svakodnevnih reči ima
          i drugi član nego u Nemačkoj: *das* E-Mail, *das* Cola, *das*
          Joghurt.
        </Note>
      </Cols>
    </Block>

    <Block title="Pet tipova množine">
      <GTable
        wrap
        head={["Nastavak", "Kada", "Primeri", "srpski"]}
        rows={[
          [
            "*-e* (± Umlaut)",
            "najčešće muški rod",
            "der Tisch → die Tisch*e*; die Hand → die H*ä*nd*e*",
            "sto → stolovi; ruka → ruke",
          ],
          [
            "*-er* (± Umlaut)",
            "kratke imenice srednjeg roda",
            "das Kind → die Kind*er*; das Buch → die B*ü*ch*er*",
            "dete → deca; knjiga → knjige",
          ],
          [
            "*-(e)n*",
            "skoro sve imenice ženskog roda",
            "die Frau → die Frau*en*; die Blume → die Blume*n*",
            "žena → žene; cvet → cveće",
          ],
          [
            "*-s*",
            "strane reči, skraćenice",
            "das Auto → die Auto*s*; das Handy → die Handy*s*",
            "auto → auta; mobilni telefon → mobilni telefoni",
          ],
          [
            "bez nastavka (± Umlaut)",
            "-er, -en, -el, -chen, -lein",
            "der Lehrer → die Lehrer; der Vater → die V*ä*ter",
            "nastavnik → nastavnici; otac → očevi",
          ],
        ]}
      />
      <Note title="Dativ množine" tone="rule">
        U dativu množine imenica dobija dodatno *-n*: mit den Kind*ern*, mit den
        Freund*en*. Izuzetak su množine na -s: mit den Autos.
      </Note>
    </Block>

    <Block title="n-deklinacija">
      <P>
        Mala grupa imenica muškog roda dobija *-(e)n* u svim padežima osim u
        nominativu jednine. To su najčešće živa bića i reči na -e, -ent, -ist,
        -ant, -oge.
      </P>
      <GTable
        head={["Padež", "jednina", "množina"]}
        rows={[
          ["Nominativ", "der Student", "die Student*en*"],
          ["Akkusativ", "den Student*en*", "die Student*en*"],
          ["Dativ", "dem Student*en*", "den Student*en*"],
          ["Genitiv", "des Student*en*", "der Student*en*"],
        ]}
      />
      <GTable
        wrap
        head={["Imenica", "srpski", "Imenica", "srpski"]}
        rows={[
          ["der Junge", "dečak", "der Nachbar", "komšija"],
          ["der Kunde", "mušterija", "der Student", "student"],
          ["der Kollege", "kolega", "der Polizist", "policajac"],
          ["der Neffe", "nećak", "der Praktikant", "praktikant"],
          ["der Mensch", "čovek", "der Psychologe", "psiholog"],
          ["der Herr", "gospodin (jednina -n, množina -en)", "der Name", "ime (Genitiv: des Namens)"],
        ]}
      />
      <Examples
        items={[
          ["Ich kenne diesen *Studenten*.", "Poznajem tog studenta."],
          [
            "Ich spreche mit meinem *Kollegen*.",
            "Razgovaram sa svojim kolegom.",
          ],
        ]}
      />
    </Block>

    <Block title="Složenice">
      <P>
        Nemački spaja reči u jednu. Rod i množinu određuje *poslednja* reč,
        prethodne je samo bliže opisuju.
      </P>
      <Examples
        items={[
          ["das Haus + die Tür → *die* Haustür", "kućna vrata"],
          ["die Arbeit + das Zimmer → *das* Arbeitszimmer", "radna soba"],
          [
            "der Geburtstag*s*kuchen",
            "rođendanska torta",
            "spojno -s-",
          ],
        ]}
      />
    </Block>
  </Section>
);

const PRONOUNS = () => (
  <Section
    title="Zamenice"
    lead="Zamenica menja imenicu. Rod i broj uzima od imenice koju zamenjuje, a padež od svoje uloge u rečenici."
  >
    <Block title="Koju zamenicu kada">
      <GTable
        wrap
        head={["Šta hoćeš da kažeš", "Vrsta", "Primer", "srpski"]}
        rows={[
          [
            "zamenjuješ već pomenutu imenicu",
            "lična",
            "Wo ist Tom? *Er* schläft.",
            "Gde je Tom? Spava.",
          ],
          [
            "kažeš čije je nešto",
            "prisvojna",
            "Das ist *mein* Buch.",
            "To je moja knjiga.",
          ],
          [
            "radnja se vraća na subjekat",
            "povratna",
            "Ich freue *mich*.",
            "Radujem se.",
          ],
          [
            "pokazuješ na nešto određeno",
            "pokazna",
            "*Dieses* Buch ist neu.",
            "Ova knjiga je nova.",
          ],
          [
            "govoriš uopšteno, bez vršioca",
            "neodređena",
            "*Man* sagt das nicht.",
            "To se ne kaže.",
          ],
          [
            "spajaš dve rečenice o istoj imenici",
            "relativna",
            "Der Mann, *der* dort steht...",
            "Čovek koji tamo stoji...",
          ],
        ]}
      />
    </Block>

    <Block title="Prisvojne zamenice">
      <GTable
        wrap
        head={["Osoba", "Osnova", "Primer", "srpski"]}
        rows={[
          ["ich", "mein-", "*mein* Vater", "moj otac"],
          ["du", "dein-", "*deine* Mutter", "tvoja majka"],
          ["er / es", "sein-", "*sein* Auto", "njegov auto"],
          ["sie", "ihr-", "*ihr* Buch", "njena knjiga"],
          ["wir", "unser-", "*unsere* Wohnung", "naš stan"],
          ["ihr", "euer-", "*eure* Kinder", "vaša deca"],
          ["sie", "ihr-", "*ihre* Freunde", "njihovi prijatelji"],
          ["Sie", "Ihr-", "*Ihre* Adresse", "Vaša adresa (učtivo)"],
        ]}
      />
      <Note title="Isti nastavci" tone="rule">
        Nastavci su isti kao kod ein i kein. Kod euer nestaje e kad dođe
        nastavak: euer → *eure*, *euren*. Lične zamenice kroz sva tri padeža
        nalaziš u oblasti Padeži.
      </Note>
    </Block>

    <Cols>
      <Block title="Povratne zamenice">
        <GTable
          head={["Osoba", "srpski", "Akkusativ", "Dativ"]}
          rows={[
            ["ich", "ja", "mich", "mir"],
            ["du", "ti", "dich", "dir"],
            ["er / sie / es", "on, ona, ono", "sich", "sich"],
            ["wir", "mi", "uns", "uns"],
            ["ihr", "vi", "euch", "euch"],
            ["sie / Sie", "oni, Vi", "sich", "sich"],
          ]}
        />
        <P>Dativ dolazi kad u rečenici već postoji Akkusativ objekat.</P>
        <Examples
          items={[
            ["Ich wasche *mich*.", "Perem se.", "Akkusativ"],
            ["Ich wasche *mir* die Hände.", "Perem ruke sebi.", "Dativ"],
          ]}
        />
      </Block>

      <Block title="Zamenica es">
        <P>
          es često nije prava zamenica nego popunjava mesto subjekta koje
          nemačka rečenica mora da ima.
        </P>
        <Examples
          items={[
            ["*Es* regnet. *Es* ist kalt.", "Pada kiša. Hladno je.", "bezlično"],
            ["*Es* gibt hier kein Wasser.", "Ovde nema vode.", "es gibt"],
            [
              "Wo ist das Buch? *Es* liegt dort.",
              "Gde je knjiga? Leži tamo.",
              "srednji rod",
            ],
            [
              "*Es* kamen viele Gäste.",
              "Došlo je mnogo gostiju.",
              "prazan subjekat",
            ],
            [
              "*Es* freut mich, dass du kommst.",
              "Raduje me što dolaziš.",
              "najavljuje rečenicu",
            ],
          ]}
        />
      </Block>
    </Cols>

    <Block title="Pokazne zamenice">
      <GTable
        wrap
        head={["Zamenica", "Značenje", "Primer", "srpski"]}
        rows={[
          [
            "dieser, diese, dieses",
            "ovaj, ova, ovo (menja se kao der, die, das)",
            "*Dieses* Buch ist neu.",
            "Ova knjiga je nova.",
          ],
          [
            "jener",
            "onaj (retko u govoru, više u pisanju)",
            "in *jenen* Jahren",
            "onih godina",
          ],
          [
            "der, die, das",
            "kao naglašeno „taj“ u govoru",
            "Kennst du Tom? *Den* kenne ich gut.",
            "Poznaješ li Toma? Njega dobro znam.",
          ],
          [
            "derselbe",
            "isti (identičan)",
            "Wir haben *dieselbe* Idee.",
            "Imamo istu ideju.",
          ],
          [
            "solcher",
            "takav",
            "*Solche* Filme mag ich nicht.",
            "Takve filmove ne volim.",
          ],
        ]}
      />
    </Block>

    <Block title="Neodređene zamenice">
      <GTable
        wrap
        head={["Reč", "Značenje", "Primer", "srpski"]}
        rows={[
          [
            "man",
            "neko ili bezlično „se“, uvek sa 3. licem jednine",
            "Hier darf *man* nicht rauchen.",
            "Ovde se ne sme pušiti.",
          ],
          [
            "jemand / niemand",
            "neko / niko",
            "*Jemand* hat angerufen.",
            "Neko je zvao.",
          ],
          [
            "etwas / nichts",
            "nešto / ništa",
            "Ich habe *nichts* gesagt.",
            "Ništa nisam rekao.",
          ],
          [
            "alle / alles",
            "svi (ljudi) / sve (stvari)",
            "*Alle* sind da. *Alles* ist gut.",
            "Svi su tu. Sve je u redu.",
          ],
          [
            "jeder",
            "svaki, menja se kao dieser",
            "*Jeden* Tag lerne ich.",
            "Svaki dan učim.",
          ],
          [
            "einige, manche, mehrere",
            "neki, poneki, više njih",
            "*Einige* Studenten fehlen.",
            "Neki studenti nedostaju.",
          ],
          [
            "viele / wenige",
            "mnogi / malobrojni",
            "*Viele* Leute denken so.",
            "Mnogi ljudi tako misle.",
          ],
          [
            "beide",
            "oboje / oba",
            "*Beide* Bücher sind gut.",
            "Obe knjige su dobre.",
          ],
        ]}
      />
    </Block>
  </Section>
);

const ADJECTIVES = () => (
  <Section
    title="Pridevi"
    lead="Pridev se menja samo kad stoji ispred imenice. Posle sein, werden i bleiben ostaje nepromenjen: Das Auto ist neu. Komparativ i superlativ imaju svoju oblast."
  >
    <Note title="Logika u jednoj rečenici" tone="tip">
      Ako član već jasno pokazuje rod i padež, pridev je „lenj“ i uzima -e ili
      -en. Ako člana nema, pridev mora sam da preuzme nastavak člana.
    </Note>

    <Block title="Kada se pridev menja">
      <GTable
        wrap
        head={["Položaj", "Menja se?", "Primer", "srpski"]}
        rows={[
          [
            "ispred imenice",
            "*da*, dobija nastavak",
            "Ich habe ein *neues* Auto.",
            "Imam nov auto.",
          ],
          [
            "posle sein, werden, bleiben",
            "*ne*, ostaje osnovni oblik",
            "Das Auto ist *neu*.",
            "Auto je nov.",
          ],
          [
            "kao prilog uz glagol",
            "*ne*",
            "Er singt *gut*.",
            "On dobro peva.",
          ],
          [
            "kao imenica",
            "*da*, i piše se veliko",
            "Der *Neue* kommt morgen.",
            "Novi dolazi sutra.",
          ],
        ]}
      />
      <P>
        Ako se menja, nastavak zavisi samo od toga *šta stoji ispred prideva*:
        određeni član, neodređeni član ili ništa. To su tri tabele ispod.
      </P>
    </Block>

    <Block title="Slaba deklinacija posle der, die, das, dieser, jeder, alle">
      <GTable
        head={["", "muški", "ženski", "srednji", "množina"]}
        rows={[
          ["Nominativ", "der gut*e*", "die gut*e*", "das gut*e*", "die gut*en*"],
          ["Akkusativ", "den gut*en*", "die gut*e*", "das gut*e*", "die gut*en*"],
          ["Dativ", "dem gut*en*", "der gut*en*", "dem gut*en*", "den gut*en*"],
          ["Genitiv", "des gut*en*", "der gut*en*", "des gut*en*", "der gut*en*"],
        ]}
      />
      <P>
        Samo pet polja ima *-e*, sve ostalo je *-en*. Zato je ovo najlakša
        tabela.
      </P>
    </Block>

    <Block title="Mešovita deklinacija posle ein, kein, mein">
      <GTable
        head={["", "muški", "ženski", "srednji", "množina"]}
        rows={[
          ["Nominativ", "ein gut*er*", "eine gut*e*", "ein gut*es*", "keine gut*en*"],
          ["Akkusativ", "einen gut*en*", "eine gut*e*", "ein gut*es*", "keine gut*en*"],
          ["Dativ", "einem gut*en*", "einer gut*en*", "einem gut*en*", "keinen gut*en*"],
          ["Genitiv", "eines gut*en*", "einer gut*en*", "eines gut*en*", "keiner gut*en*"],
        ]}
      />
      <P>
        Razlika u odnosu na slabu je samo u tri polja gore levo, tamo gde ein ne
        pokazuje rod: *-er*, *-es*.
      </P>
    </Block>

    <Block title="Jaka deklinacija bez člana">
      <GTable
        head={["", "muški", "ženski", "srednji", "množina"]}
        rows={[
          ["Nominativ", "gut*er* Wein", "gut*e* Milch", "gut*es* Bier", "gut*e* Weine"],
          ["Akkusativ", "gut*en* Wein", "gut*e* Milch", "gut*es* Bier", "gut*e* Weine"],
          ["Dativ", "gut*em* Wein", "gut*er* Milch", "gut*em* Bier", "gut*en* Weinen"],
          ["Genitiv", "gut*en* Weines", "gut*er* Milch", "gut*en* Bieres", "gut*er* Weine"],
        ]}
      />
      <P>
        Pridev preuzima nastavke određenog člana (der → -er, dem → -em, das →
        -es). Ovo se javlja uz gradivne imenice, u množini bez člana i posle
        viele, wenige, einige, mehrere.
      </P>
    </Block>

    <Block title="Pridev + predlog">
      <GTable
        wrap
        head={["Izraz", "srpski", "Padež", "Primer", "srpski"]}
        rows={[
          [
            "stolz auf",
            "ponosan na",
            "Akkusativ",
            "Ich bin stolz *auf dich*.",
            "Ponosan sam na tebe.",
          ],
          [
            "zufrieden mit",
            "zadovoljan sa",
            "Dativ",
            "Er ist *mit der Arbeit* zufrieden.",
            "Zadovoljan je poslom.",
          ],
          [
            "interessiert an",
            "zainteresovan za",
            "Dativ",
            "Sie ist *an Kunst* interessiert.",
            "Zanima je umetnost.",
          ],
          [
            "abhängig von",
            "zavisan od",
            "Dativ",
            "Das ist abhängig *vom Wetter*.",
            "To zavisi od vremena.",
          ],
          [
            "verantwortlich für",
            "odgovoran za",
            "Akkusativ",
            "Wer ist verantwortlich *für das Projekt*?",
            "Ko je odgovoran za projekat?",
          ],
          [
            "böse / sauer auf",
            "ljut na",
            "Akkusativ",
            "Sie ist böse *auf ihn*.",
            "Ljuta je na njega.",
          ],
          [
            "bereit zu",
            "spreman za",
            "Dativ",
            "Ich bin bereit *zum Gespräch*.",
            "Spreman sam za razgovor.",
          ],
          [
            "typisch für",
            "tipično za",
            "Akkusativ",
            "Das ist typisch *für ihn*.",
            "To je tipično za njega.",
          ],
          [
            "reich / arm an",
            "bogat / siromašan nečim",
            "Dativ",
            "Obst ist reich *an Vitaminen*.",
            "Voće je bogato vitaminima.",
          ],
          [
            "ähnlich",
            "sličan",
            "Dativ (bez predloga)",
            "Er ist *seinem Vater* ähnlich.",
            "Liči na svog oca.",
          ],
        ]}
      />
    </Block>

    <Block title="Poimeničeni pridevi">
      <P>
        Pridev može da postane imenica. Piše se velikim slovom, ali zadržava
        nastavke prideva.
      </P>
      <Examples
        items={[
          ["*der Deutsche* / *ein Deutscher*", "Nemac"],
          ["*die Bekannte* / *eine Bekannte*", "poznanica"],
          ["etwas *Neues*, nichts *Gutes*, viel *Interessantes*", "nešto novo, ništa dobro, mnogo zanimljivog"],
          ["Alles *Gute* zum Geburtstag!", "Sve najbolje za rođendan!"],
        ]}
      />
    </Block>
  </Section>
);

const COMPARISON = () => (
  <Section
    title="Poređenje"
    lead="Komparativ se gradi nastavkom -er, superlativ oblikom am ...-sten. Nepravilnih ima svega nekoliko i oni pokrivaju najveći deo svakodnevnog govora."
  >
    <Block title="Kako se gradi">
      <Formula>
        pozitiv → komparativ *-er* → superlativ *am ...-sten*
      </Formula>
      <GTable
        head={["Pozitiv", "Komparativ", "Superlativ", "srpski"]}
        rows={[
          ["schnell", "schnell*er*", "am schnell*sten*", "brz"],
          ["klein", "klein*er*", "am klein*sten*", "mali"],
          ["billig", "billig*er*", "am billig*sten*", "jeftin"],
        ]}
      />
    </Block>

    <Block title="Sa Umlautom">
      <P>
        Jednosložni pridevi sa a, o ili u obično dobijaju Umlaut u komparativu i
        superlativu.
      </P>
      <GTable
        head={["Pozitiv", "Komparativ", "Superlativ", "srpski"]}
        rows={[
          ["alt", "*ä*lter", "am *ä*ltesten", "star"],
          ["jung", "j*ü*nger", "am j*ü*ngsten", "mlad"],
          ["lang", "l*ä*nger", "am l*ä*ngsten", "dug"],
          ["kurz", "k*ü*rzer", "am k*ü*rzesten", "kratak"],
          ["stark", "st*ä*rker", "am st*ä*rksten", "jak"],
          ["warm", "w*ä*rmer", "am w*ä*rmsten", "topao"],
          ["kalt", "k*ä*lter", "am k*ä*ltesten", "hladan"],
          ["groß", "gr*ö*ßer", "am gr*ö*ßten", "velik"],
        ]}
      />
      <Note title="Nastavak -esten" tone="rule">
        Osnova na -d, -t, -s, -ß, -z, -sch dobija *-esten* u superlativu, da bi
        se moglo izgovoriti: am ält*esten*, am kürz*esten*, am heiß*esten*.
        Izuzetak je groß: am gr*ößten*, ne „am größesten“.
      </Note>
    </Block>

    <Block title="Nepravilno poređenje">
      <P>Ovih šest se uče napamet, jer se javljaju svaki dan.</P>
      <GTable
        head={["Pozitiv", "Komparativ", "Superlativ", "srpski"]}
        rows={[
          ["gut", "*besser*", "am *besten*", "dobar, bolji, najbolji"],
          ["viel", "*mehr*", "am *meisten*", "mnogo, više, najviše"],
          ["gern", "*lieber*", "am *liebsten*", "rado, radije, najradije"],
          ["hoch", "*höher*", "am *höchsten*", "visok, viši, najviši"],
          ["nah", "*näher*", "am *nächsten*", "blizu, bliže, najbliže"],
          ["teuer", "*teurer*", "am teuersten", "skup, skuplji, najskuplji"],
        ]}
      />
      <Examples
        items={[
          ["Dein Deutsch wird immer *besser*.", "Tvoj nemački je sve bolji."],
          [
            "Ich trinke *lieber* Tee als Kaffee.",
            "Radije pijem čaj nego kafu.",
          ],
          [
            "Am *liebsten* bleibe ich zu Hause.",
            "Najradije ostajem kod kuće.",
          ],
        ]}
      />
    </Block>

    <Block title="Poređenje u rečenici">
      <GTable
        wrap
        head={["Konstrukcija", "Značenje", "Primer", "srpski"]}
        rows={[
          [
            "*so ... wie*",
            "isto koliko",
            "Anna ist *so groß wie* Tom.",
            "Ana je visoka kao Tom.",
          ],
          [
            "*nicht so ... wie*",
            "manje nego",
            "Heute ist es *nicht so kalt wie* gestern.",
            "Danas nije hladno kao juče.",
          ],
          [
            "komparativ + *als*",
            "više nego",
            "Anna ist *größer als* Tom.",
            "Ana je viša od Toma.",
          ],
          [
            "*immer* + komparativ",
            "sve više",
            "Es wird *immer kälter*.",
            "Postaje sve hladnije.",
          ],
          [
            "*je ... desto / umso*",
            "što ... to",
            "*Je* mehr ich lerne, *desto* besser verstehe ich.",
            "Što više učim, to bolje razumem.",
          ],
        ]}
      />
      <Note title="wie ili als" tone="compare">
        *wie* ide kad su dve stvari iste, *als* kad se razlikuju. Nikad zajedno:
        größer *als*, ne „größer wie“, iako se to čuje u govoru.
      </Note>
    </Block>

    <Block title="Ispred imenice">
      <P>
        Kad komparativ ili superlativ stoji ispred imenice, ponaša se kao svaki
        drugi pridev: dobija član i nastavak, a superlativ gubi am.
      </P>
      <Examples
        items={[
          ["Das ist *der beste* Film.", "To je najbolji film.", "superlativ"],
          [
            "Ich brauche *ein größeres* Zimmer.",
            "Treba mi veća soba.",
            "komparativ",
          ],
          [
            "Sie hat *die schönsten* Augen.",
            "Ona ima najlepše oči.",
            "množina",
          ],
        ]}
      />
      <Note title="Dva superlativa" tone="compare">
        *am schönsten* stoji samostalno (Der Garten ist am schönsten), a *der
        schönste* ide uz imenicu (der schönste Garten).
      </Note>
    </Block>
  </Section>
);

const ADVERBS = () => (
  <Section
    title="Prilozi"
    lead="Prilozi se ne dekliniraju, samo se nekolicina poredi (gern → lieber, oft → öfter). Nemački nema poseban nastavak za priloge kao englesko -ly: isti oblik služi i kao pridev i kao prilog, na primer Er singt gut."
  >
    <Block title="Vrste priloga">
      <GTable
        wrap
        head={["Vrsta", "Pitanje", "Primeri", "srpski"]}
        rows={[
          [
            "vremenski",
            "wann?",
            "heute, morgen, gestern, jetzt, bald, früher, damals, danach",
            "danas, sutra, juče, sada, uskoro, ranije, tada, zatim",
          ],
          [
            "vremenski",
            "wie oft?",
            "immer, oft, manchmal, selten, nie, schon, noch, gerade",
            "uvek, često, ponekad, retko, nikad, već, još, upravo",
          ],
          [
            "mesni",
            "wo? wohin? woher?",
            "hier, dort, oben, unten, links, rechts, draußen, drinnen, überall, nirgendwo",
            "ovde, tamo, gore, dole, levo, desno, napolju, unutra, svuda, nigde",
          ],
          [
            "načinski",
            "wie?",
            "gern, sehr, kaum, fast, plötzlich, zusammen, allein, leider, hoffentlich, vielleicht",
            "rado, vrlo, jedva, skoro, iznenada, zajedno, sam, nažalost, nadam se, možda",
          ],
          [
            "uzročni i posledični",
            "warum? wozu?",
            "deshalb, deswegen, darum, daher, also, sonst, folglich",
            "zato, zbog toga, stoga, otuda, dakle, inače, sledstveno",
          ],
        ]}
      />
    </Block>

    <Cols>
      <Block title="Učestalost">
        <P>
          Ovi prilozi stoje u sredini rečenice i odgovaraju na pitanje wie oft,
          koliko često.
        </P>
        <GTable
          head={["Reč", "Koliko", "srpski"]}
          rows={[
            ["immer", "100%", "uvek"],
            ["meistens", "~80%", "uglavnom"],
            ["oft", "~70%", "često"],
            ["manchmal", "~40%", "ponekad"],
            ["selten", "~10%", "retko"],
            ["nie / niemals", "0%", "nikad"],
          ]}
        />
      </Block>

      <Block title="Red priloga: TeKaMoLo">
        <P>
          Kad se u sredini rečenice nađe više odredbi, redosled je *Te*mporal →
          *Ka*usal → *Mo*dal → *Lo*kal.
        </P>
        <Formula>vreme → razlog → način → mesto</Formula>
        <Examples
          items={[
            [
              "Ich fahre *morgen* *wegen der Arbeit* *mit dem Zug* *nach Berlin*.",
              "Sutra zbog posla idem vozom za Berlin.",
            ],
            [
              "Er ist *gestern* *aus Angst* *schnell* *nach Hause* gelaufen.",
              "Juče je iz straha brzo otrčao kući.",
            ],
          ]}
        />
        <Note title="Smernica" tone="tip">
          Ovo je smernica, ne zakon. Element koji hoćeš da naglasiš možeš izvući
          na prvo mesto: *Nach Berlin* fahre ich morgen.
        </Note>
      </Block>
    </Cols>

    <Block title="Zamenički prilozi da(r)- i wo(r)-">
      <P>
        Kad se predloška dopuna odnosi na *stvar* ili na celu rečenicu, ne
        koristi se zamenica nego spoj *da(r)- + predlog*. U pitanju je *wo(r)- +
        predlog*. R se ubacuje kad predlog počinje samoglasnikom.
      </P>
      <GTable
        wrap
        head={[
          "Za stvar",
          "Pitanje za stvar",
          "Za osobu",
          "Pitanje za osobu",
          "srpski",
        ]}
        rows={[
          ["*damit*", "*womit*?", "mit ihm", "mit wem?", "sa tim / sa kim"],
          ["*darauf*", "*worauf*?", "auf ihn", "auf wen?", "na to / na koga"],
          ["*davon*", "*wovon*?", "von ihr", "von wem?", "o tome / od koga"],
          [
            "*darüber*",
            "*worüber*?",
            "über ihn",
            "über wen?",
            "o tome / o kome",
          ],
          ["*dafür*", "*wofür*?", "für sie", "für wen?", "za to / za koga"],
        ]}
      />
      <Examples
        items={[
          ["Ich freue mich *darauf*.", "Radujem se tome.", "stvar"],
          ["*Worauf* freust du dich?", "Čemu se raduješ?", "pitanje"],
          ["Ich freue mich *auf dich*.", "Radujem se tebi.", "osoba"],
          [
            "Ich denke *daran*, dass du morgen kommst.",
            "Mislim na to da sutra dolaziš.",
            "cela rečenica",
          ],
        ]}
      />
    </Block>
  </Section>
);

const PREPOSITIONS = () => (
  <Section
    title="Predlozi"
    lead="Predlog uvek nosi padež sa sobom. Najkorisnije je pamtiti ih u grupama, jer je padež deo same reči."
  >
    <Block title="Uvek Akkusativ">
      <GTable
        wrap
        head={["Predlog", "Značenje", "Primer", "srpski"]}
        rows={[
          ["durch", "kroz", "Wir gehen *durch den* Park.", "Idemo kroz park."],
          ["für", "za", "Das ist *für meinen* Bruder.", "To je za mog brata."],
          ["gegen", "protiv, oko (vreme)", "Ich komme *gegen* 8 Uhr.", "Dolazim oko 8."],
          ["ohne", "bez", "Ich gehe *ohne einen* Plan.", "Idem bez plana."],
          ["um", "oko, u (sat)", "Wir sitzen *um den* Tisch.", "Sedimo oko stola."],
          ["bis", "do", "Ich bleibe *bis nächsten* Montag.", "Ostajem do sledećeg ponedeljka."],
          ["entlang", "duž (ide iza imenice)", "Wir gehen die Straße *entlang*.", "Idemo duž ulice."],
        ]}
      />
    </Block>

    <Block title="Uvek Dativ">
      <GTable
        wrap
        head={["Predlog", "Značenje", "Primer", "srpski"]}
        rows={[
          ["aus", "iz", "Ich komme *aus der* Schweiz.", "Dolazim iz Švajcarske."],
          ["bei", "kod, pri", "Ich bin *bei meinem* Freund.", "Kod druga sam."],
          ["mit", "sa", "Ich fahre *mit dem* Auto.", "Idem autom."],
          ["nach", "posle, ka (grad ili zemlja)", "*Nach dem* Essen schlafe ich.", "Posle jela spavam."],
          ["seit", "od (traje do sada)", "Ich wohne hier *seit einem* Jahr.", "Živim ovde godinu dana."],
          ["von", "od", "Das ist *von meiner* Mutter.", "To je od moje majke."],
          ["zu", "ka, kod (osoba ili ustanova)", "Ich gehe *zum* Arzt.", "Idem kod lekara."],
          ["gegenüber", "preko puta", "Er wohnt *dem* Bahnhof *gegenüber*.", "Stanuje preko puta stanice."],
          ["ab", "od (nadalje)", "*Ab* Montag arbeite ich.", "Od ponedeljka radim."],
          ["außer", "osim", "Alle *außer mir* sind da.", "Svi osim mene su tu."],
        ]}
      />
    </Block>

    <Block title="Devet predloga sa dva lica (Wechselpräpositionen)">
      <P>
        an, auf, hinter, in, neben, über, unter, vor, zwischen. Pitanje odlučuje
        padež: *wohin?* (kretanje ka cilju) → Akkusativ, *wo?* (mesto gde nešto
        jeste) → Dativ.
      </P>
      <GTable
        wrap
        head={["Predlog", "wohin? (Akkusativ)", "srpski", "wo? (Dativ)", "srpski"]}
        rows={[
          [
            "in",
            "Ich gehe in *die* Schule.",
            "Idem u školu.",
            "Ich bin in *der* Schule.",
            "U školi sam.",
          ],
          [
            "an",
            "Ich hänge das Bild an *die* Wand.",
            "Kačim sliku na zid.",
            "Das Bild hängt an *der* Wand.",
            "Slika visi na zidu.",
          ],
          [
            "auf",
            "Ich lege das Buch auf *den* Tisch.",
            "Stavljam knjigu na sto.",
            "Das Buch liegt auf *dem* Tisch.",
            "Knjiga leži na stolu.",
          ],
          [
            "unter",
            "Die Katze läuft unter *das* Bett.",
            "Mačka trči pod krevet.",
            "Die Katze schläft unter *dem* Bett.",
            "Mačka spava pod krevetom.",
          ],
          [
            "zwischen",
            "Er stellt sich zwischen *die* Stühle.",
            "Staje između stolica.",
            "Er steht zwischen *den* Stühlen.",
            "Stoji između stolica.",
          ],
        ]}
      />
      <Note title="Parovi glagola" tone="compare">
        Kretanje: legen, stellen, setzen, hängen (pravilni, + Akkusativ).
        Mirovanje: liegen, stehen, sitzen, hängen (nepravilni, + Dativ). Ich
        *stelle* die Flasche auf den Tisch. → Die Flasche *steht* auf dem Tisch.
      </Note>
    </Block>

    <Block title="Genitiv predlozi">
      <GTable
        wrap
        head={["Predlog", "Značenje", "Primer", "srpski"]}
        rows={[
          ["wegen", "zbog", "*wegen des* Wetter*s*", "zbog vremena"],
          ["während", "tokom", "*während der* Ferien", "tokom raspusta"],
          ["trotz", "uprkos", "*trotz des* Regen*s*", "uprkos kiši"],
          ["statt / anstatt", "umesto", "*statt eines* Anruf*s*", "umesto poziva"],
          ["außerhalb", "izvan", "*außerhalb der* Stadt", "izvan grada"],
          ["innerhalb", "unutar, u roku od", "*innerhalb einer* Woche", "u roku od nedelju dana"],
          ["aufgrund", "na osnovu, usled", "*aufgrund der* Krise", "usled krize"],
          ["laut", "prema (izvoru)", "*laut des* Berichts", "prema izveštaju"],
        ]}
      />
      <Note title="U Austriji" tone="austria">
        U govoru se uz wegen i trotz vrlo često čuje Dativ: *wegen dem* Wetter,
        *trotz dem* Regen. Razumeće te svuda, ali na ispitu i u pisanju drži se
        Genitiva.
      </Note>
    </Block>

    <Block title="Sažimanja">
      <P>
        Predlog i član se u govoru stapaju. Ovo je standardno, ne skraćivanje.
      </P>
      <GTable
        head={["Sažeto", "Puno", "Sažeto", "Puno"]}
        rows={[
          ["im", "in dem", "ins", "in das"],
          ["am", "an dem", "ans", "an das"],
          ["beim", "bei dem", "aufs", "auf das"],
          ["zum", "zu dem", "zur", "zu der"],
          ["vom", "von dem", "fürs", "für das"],
        ]}
      />
    </Block>

    <Block title="Mesto: in, nach, zu, bei">
      <GTable
        wrap
        head={["Kada", "Predlog", "Primer", "srpski"]}
        rows={[
          ["gradovi i zemlje bez člana", "nach", "Ich fliege *nach* Wien.", "Letim za Beč."],
          ["zemlje sa članom", "in + Akkusativ", "Ich fahre *in die* Türkei.", "Idem u Tursku."],
          ["osobe i ustanove (cilj)", "zu", "Ich gehe *zum* Arzt.", "Idem kod lekara."],
          ["osobe i ustanove (gde si)", "bei", "Ich bin *beim* Arzt.", "Kod lekara sam."],
          ["ulazak u prostor", "in + Akkusativ", "Ich gehe *ins* Kino.", "Idem u bioskop."],
          ["kuća", "nach / zu", "*nach* Hause / *zu* Hause", "kući (idem) / kod kuće (jesam)"],
        ]}
      />
    </Block>

    <Block title="Vreme">
      <GTable
        wrap
        head={["Izraz", "Za šta", "Primer", "srpski"]}
        rows={[
          ["am", "dani i delovi dana", "*am* Montag, *am* Abend", "u ponedeljak, uveče"],
          ["im", "meseci i godišnja doba", "*im* Januar, *im* Sommer", "u januaru, leti"],
          ["um", "tačan sat", "*um* 8 Uhr", "u 8 sati"],
          ["in + Dativ", "za koliko vremena", "*in* einer Woche", "za nedelju dana"],
          ["vor + Dativ", "pre koliko vremena", "*vor* zwei Jahren", "pre dve godine"],
          ["seit + Dativ", "od kada traje", "*seit* 2020", "od 2020."],
          ["ab", "od kada nadalje", "*ab* Montag", "od ponedeljka"],
          ["bis", "do kada", "*bis* Freitag", "do petka"],
          ["während + Genitiv", "tokom", "*während* der Ferien", "tokom raspusta"],
          ["bez predloga (Akkusativ)", "trajanje i tačan dan", "*jeden* Tag, *letzten* Montag", "svaki dan, prošlog ponedeljka"],
        ]}
      />
      <Note title="Izuzetak" tone="warn">
        *in der* Nacht, ne „am Nacht“.
      </Note>
      <Note title="U Austriji" tone="austria">
        Prvi mesec se zove *Jänner*, ne Januar. To je zvanični austrijski
        oblik, i tako stoji na dokumentima i u kalendaru. Za februar se pored
        Februar sreće i *Feber*, uglavnom u zvaničnom jeziku.
      </Note>
    </Block>

    <Block title="Glagoli sa čvrstim predlogom">
      <P>
        Ovo je jedan od najvažnijih spiskova za B1 i B2. Predlog se uči zajedno
        sa glagolom, kao jedna reč.
      </P>
      <GTable
        wrap
        head={["Glagol + predlog", "Padež", "srpski", "Primer"]}
        rows={[
          ["warten auf", "Akk", "čekati nekoga", "Ich warte *auf den* Bus."],
          ["sich freuen auf", "Akk", "radovati se nečemu što dolazi", "Ich freue mich *auf* den Urlaub."],
          ["sich freuen über", "Akk", "radovati se nečemu što se desilo", "Ich freue mich *über* das Geschenk."],
          ["denken an", "Akk", "misliti na", "Ich denke *an dich*."],
          ["sich erinnern an", "Akk", "sećati se", "Erinnerst du dich *an* ihn?"],
          ["sich gewöhnen an", "Akk", "navikavati se na", "Ich gewöhne mich *an* das Wetter."],
          ["sich interessieren für", "Akk", "zanimati se za", "Er interessiert sich *für* Musik."],
          ["sich kümmern um", "Akk", "brinuti se o", "Sie kümmert sich *um* die Kinder."],
          ["sich bewerben um / bei", "Akk / Dat", "konkurisati za / kod", "Ich bewerbe mich *um* die Stelle."],
          ["achten auf", "Akk", "paziti na", "Achte *auf* deine Sachen!"],
          ["sich verlassen auf", "Akk", "osloniti se na", "Ich verlasse mich *auf dich*."],
          ["bitten um", "Akk", "moliti za", "Ich bitte *um* Hilfe."],
          ["danken für", "Akk", "zahvaliti za", "Ich danke dir *für* alles."],
          ["sich ärgern über", "Akk", "ljutiti se zbog", "Ich ärgere mich *über* den Lärm."],
          ["sich beschweren über", "Akk", "žaliti se na", "Er beschwert sich *über* das Essen."],
          ["teilnehmen an", "Dat", "učestvovati u", "Ich nehme *am* Kurs teil."],
          ["gehören zu", "Dat", "spadati u", "Das gehört *zu* meiner Arbeit."],
          ["leiden unter", "Dat", "patiti od", "Er leidet *unter* Stress."],
          ["bestehen aus", "Dat", "sastojati se od", "Das Team besteht *aus* fünf Leuten."],
          ["zweifeln an", "Dat", "sumnjati u", "Ich zweifle *an* der Idee."],
          ["abhängen von", "Dat", "zavisiti od", "Das hängt *vom* Wetter ab."],
          ["anfangen mit", "Dat", "početi sa", "Ich fange *mit* der Arbeit an."],
          ["aufhören mit", "Dat", "prestati sa", "Er hört *mit* dem Rauchen auf."],
          ["sprechen über / von", "Akk / Dat", "govoriti o", "Wir sprechen *über* das Projekt."],
          ["sich handeln um", "Akk", "raditi se o", "Es handelt sich *um* einen Fehler."],
        ]}
      />
    </Block>
  </Section>
);

const VERBS = () => (
  <Section
    title="Glagoli"
    lead="Modalni glagoli i odvojivi prefiksi menjaju oblik cele rečenice, jer razbijaju glagol na dva dela. Na dnu je i pregled svih vremena, da znaš koje kada da uzmeš."
  >
    <Block title="Modalni glagoli">
      <GTable
        wrap
        head={["Glagol", "Značenje", "ich / er", "du", "wir"]}
        rows={[
          ["können", "moći, umeti", "kann", "kannst", "können"],
          ["müssen", "morati", "muss", "musst", "müssen"],
          ["dürfen", "smeti", "darf", "darfst", "dürfen"],
          ["sollen", "trebati (tuđa volja)", "soll", "sollst", "sollen"],
          ["wollen", "hteti (jaka volja)", "will", "willst", "wollen"],
          ["mögen", "voleti", "mag", "magst", "mögen"],
          ["möchten", "želeti (učtivo)", "möchte", "möchtest", "möchten"],
        ]}
      />
      <GTable
        wrap
        head={["Kada", "Modal", "Primer", "srpski"]}
        rows={[
          [
            "sposobnost ili mogućnost",
            "können",
            "Ich *kann* schwimmen.",
            "Umem da plivam.",
          ],
          [
            "obaveza iz nužde",
            "müssen",
            "Ich *muss* zum Arzt.",
            "Moram kod lekara.",
          ],
          [
            "obaveza koju je neko drugi zadao",
            "sollen",
            "Ich *soll* mehr schlafen.",
            "Treba (kažu mi) da više spavam.",
          ],
          [
            "dozvola",
            "dürfen",
            "*Darf* ich hier parken?",
            "Smem li ovde da parkiram?",
          ],
          [
            "jaka volja i namera",
            "wollen",
            "Ich *will* Deutsch lernen.",
            "Hoću da učim nemački.",
          ],
          [
            "učtiva želja",
            "möchten",
            "Ich *möchte* einen Kaffee.",
            "Želeo bih kafu.",
          ],
          [
            "naklonost (bez infinitiva)",
            "mögen",
            "Ich *mag* Kaffee.",
            "Volim kafu.",
          ],
        ]}
      />
      <Formula>Modal na 2. mestu + ... + *Infinitiv na kraju*</Formula>
      <Examples
        items={[
          ["Ich *muss* heute lange *arbeiten*.", "Danas moram dugo da radim."],
          ["*Kannst* du mir *helfen*?", "Možeš li da mi pomogneš?"],
        ]}
      />
      <Note title="Zamka" tone="trap">
        nicht müssen znači *ne moraš* (nema obaveze). Za *ne smeš* ide nicht
        dürfen. Du musst nicht kommen = ne moraš da dođeš. Du darfst nicht
        kommen = ne smeš da dođeš.
      </Note>
    </Block>

    <Cols>
      <Block title="Odvojivi glagoli">
        <P>
          Prefiks se odvaja i ide na *kraj* rečenice: an-, auf-, aus-, ein-,
          mit-, vor-, zu-, ab-, nach-, zurück-, weg-, hin-, her-, los-.
        </P>
        <Examples
          items={[
            ["Ich *rufe* dich morgen *an*.", "Zvaću te sutra."],
            ["Der Zug *kommt* um 8 Uhr *an*.", "Voz stiže u 8."],
            ["Ich habe dich *angerufen*.", "Zvao sam te. (ge- ide u sredinu)"],
            ["Ich versuche, dich *anzurufen*.", "Pokušavam da te nazovem. (zu u sredini)"],
            ["Ich weiß, dass er heute *ankommt*.", "Znam da danas stiže. (u zavisnoj ostaje spojen)"],
          ]}
        />
      </Block>

      <Block title="Neodvojivi glagoli">
        <P>
          Prefiksi be-, ge-, er-, ver-, zer-, ent-, emp-, miss- nikad se ne
          odvajaju i *nemaju ge-* u participu.
        </P>
        <Examples
          items={[
            ["Ich *besuche* meine Oma. → Ich habe sie *besucht*.", "Posećujem baku. → Posetio sam je."],
            ["Er *verkauft* das Auto. → Er hat es *verkauft*.", "Prodaje auto. → Prodao ga je."],
            ["Sie *erklärt* die Regel. → Sie hat sie *erklärt*.", "Objašnjava pravilo. → Objasnila ga je."],
          ]}
        />
        <Note title="Još jedan izuzetak" tone="warn">
          Glagoli na *-ieren* takođe nemaju ge-: studieren → studiert,
          telefonieren → telefoniert.
        </Note>
      </Block>
    </Cols>

    <Block title="Imperativ">
      <GTable
        wrap
        head={["Kome", "Kako se gradi", "Primer", "srpski"]}
        rows={[
          ["du", "osnova bez nastavka, bez zamenice", "*Komm!* *Geh!* *Warte!*", "Dođi! Idi! Čekaj!"],
          ["ihr", "oblik za ihr, bez zamenice", "*Kommt!* *Geht!*", "Dođite! Idite!"],
          ["Sie", "infinitiv + Sie", "*Kommen Sie!* *Gehen Sie!*", "Dođite! Idite! (učtivo)"],
          ["wir (predlog)", "infinitiv + wir", "*Gehen wir!*", "Hajdemo!"],
        ]}
      />
      <Bullets
        items={[
          "Glagoli sa promenom *e → i / ie* zadržavaju je: nehmen → *Nimm!*, geben → *Gib!*, lesen → *Lies!*",
          "Glagoli sa Umlautom ga *gube*: fahren → *Fahr!*, schlafen → *Schlaf!*",
          "Nepravilno: sein → *Sei!* / *Seien Sie!*, haben → *Hab!* / *Haben Sie!*",
          "Bitte i mal ublažavaju: *Komm bitte mal her!*",
        ]}
      />
    </Block>
    <Block title="Koje vreme kada">
      <GTable
        wrap
        head={["Vreme", "Kako se gradi", "Kada se koristi", "Primer", "srpski"]}
        rows={[
          [
            "Präsens",
            "osnovni oblik",
            "sadašnjost i budućnost",
            "Ich *arbeite* morgen.",
            "Sutra radim.",
          ],
          [
            "Perfekt",
            "haben / sein + Partizip II",
            "prošlost u govoru i pismima",
            "Ich *habe gearbeitet*.",
            "Radio sam.",
          ],
          [
            "Präteritum",
            "osnova + nastavci",
            "prošlost u pisanju; uvek za sein, haben i modale",
            "Ich *arbeitete*. Ich *war*.",
            "Radio sam. Bio sam.",
          ],
          [
            "Plusquamperfekt",
            "hatte / war + Partizip II",
            "radnja pre druge prošle radnje",
            "Ich *hatte gearbeitet*.",
            "Bio sam radio.",
          ],
          [
            "Futur I",
            "werden + Infinitiv",
            "plan, obećanje, pretpostavka o sada",
            "Ich *werde arbeiten*.",
            "Radiću.",
          ],
          [
            "Futur II",
            "werden + Partizip II + haben / sein",
            "pretpostavka o prošlom",
            "Er *wird* es *vergessen haben*.",
            "Verovatno je to zaboravio.",
          ],
        ]}
      />
    </Block>

    <Block title="Kako da izabereš">
      <Bullets
        items={[
          "Govoriš o prošlosti *naglas*? Uzmi *Perfekt*, osim za sein, haben i modale, gde ide Präteritum.",
          "Pišeš priču, izveštaj ili mejl u formalnom tonu? *Präteritum* zvuči prirodnije.",
          "Dve prošle radnje, jedna pre druge? Ranija ide u *Plusquamperfekt*, kasnija u Präteritum.",
          "Govoriš o budućnosti i već imaš vremensku odredbu (morgen, nächste Woche)? Dovoljan je *Präsens*.",
          "Nagađaš šta se sada dešava ili obećavaš? Uzmi *Futur I*, često uz wohl ili sicher.",
        ]}
      />
    </Block>
  </Section>
);

const PRESENT = () => (
  <Section
    title="Präsens"
    lead="Osnovno vreme nemačkog. Pokriva ono što se dešava sada, ono što važi uvek, i, uz vremensku odredbu, ono što tek dolazi."
  >
    <Block title="Kada se koristi">
      <GTable
        wrap
        head={["Upotreba", "Primer", "srpski"]}
        rows={[
          ["radnja sada", "Ich *lese* gerade ein Buch.", "Upravo čitam knjigu."],
          ["navika i ponavljanje", "Ich *stehe* jeden Tag um 7 auf.", "Ustajem svaki dan u 7."],
          ["opšta istina", "Wasser *kocht* bei 100 Grad.", "Voda ključa na 100 stepeni."],
          [
            "budućnost sa odredbom",
            "Morgen *fahre* ich nach Berlin.",
            "Sutra idem u Berlin.",
          ],
          [
            "trajanje koje još traje (seit)",
            "Ich *wohne* seit 2020 hier.",
            "Živim ovde od 2020.",
          ],
        ]}
      />
      <Note title="Razlika od srpskog" tone="compare">
        Uz *seit* nemački koristi sadašnje vreme jer radnja i dalje traje, tamo
        gde bi srpski lako skliznuo u prošlo: Ich *arbeite* seit drei Jahren
        hier, ne „radio sam“.
      </Note>
    </Block>

    <Cols>
      <Block title="Präsens: pravilni">
        <GTable
          head={["Lice", "lernen (učiti)", "arbeiten (raditi)", "heißen (zvati se)"]}
          rows={[
            ["ich", "lern*e*", "arbeit*e*", "heiß*e*"],
            ["du", "lern*st*", "arbeit*est*", "heiß*t*"],
            ["er / sie / es", "lern*t*", "arbeit*et*", "heiß*t*"],
            ["wir", "lern*en*", "arbeit*en*", "heiß*en*"],
            ["ihr", "lern*t*", "arbeit*et*", "heiß*t*"],
            ["sie / Sie", "lern*en*", "arbeit*en*", "heiß*en*"],
          ]}
        />
        <Bullets
          items={[
            "Osnova na *-t, -d, -n* dobija umetnuto e: du arbeit*e*st, er find*e*t.",
            "Osnova na *-s, -ß, -z, -x* gubi s u drugom licu: du heißt, du tanzt.",
          ]}
        />
      </Block>

      <Block title="Präsens: promena vokala">
        <P>Samo u licima *du* i *er / sie / es*.</P>
        <GTable
          head={["Promena", "Infinitiv", "srpski", "du", "er"]}
          rows={[
            ["a → ä", "fahren", "voziti se", "fährst", "fährt"],
            ["a → ä", "schlafen", "spavati", "schläfst", "schläft"],
            ["e → i", "geben", "dati", "gibst", "gibt"],
            ["e → i", "sprechen", "govoriti", "sprichst", "spricht"],
            ["e → ie", "sehen", "videti", "siehst", "sieht"],
            ["e → ie", "lesen", "čitati", "liest", "liest"],
            ["au → äu", "laufen", "trčati", "läufst", "läuft"],
          ]}
        />
      </Block>
    </Cols>

    <Block title="sein, haben, werden">
      <Note title="Zašto baš ova tri" tone="remember">
        sein i haben grade Perfekt, a werden gradi pasiv i futur. Ko zna njih
        tri u Präsensu, može da sastavi skoro svako drugo vreme.
      </Note>
      <GTable
        head={["Lice", "sein (biti)", "haben (imati)", "werden (postati)"]}
        rows={[
          ["ich", "bin", "habe", "werde"],
          ["du", "bist", "hast", "wirst"],
          ["er / sie / es", "ist", "hat", "wird"],
          ["wir", "sind", "haben", "werden"],
          ["ihr", "seid", "habt", "werdet"],
          ["sie / Sie", "sind", "haben", "werden"],
        ]}
      />
    </Block>
  </Section>
);

const PERFECT = () => (
  <Section
    title="Perfekt"
    lead="Prošlo vreme govornog nemačkog. Sastoji se od dva dela: pomoćni glagol na drugom mestu i particip na kraju rečenice."
  >
    <Block title="Kada se koristi">
      <Formula>*haben* ili *sein* na 2. mestu + ... + *Partizip II* na kraju</Formula>
      <Bullets
        items={[
          "Sve što pričaš o prošlosti u razgovoru, mejlu ili poruci.",
          "Radnja koja je gotova, ali se njen rezultat oseća sada: Ich *habe* den Schlüssel *verloren*.",
          "Za sein, haben i modalne glagole se u govoru ipak koristi Präteritum: ich *war*, ich *hatte*, ich *musste*.",
        ]}
      />
      <Examples
        items={[
          ["Ich *habe* gestern viel *gearbeitet*.", "Juče sam mnogo radio."],
          ["Wir *sind* nach Wien *gefahren*.", "Otputovali smo u Beč."],
          ["*Hast* du das Buch *gelesen*?", "Jesi li pročitao knjigu?"],
        ]}
      />
    </Block>

    <Block title="Partizip II: pet obrazaca">
      <GTable
        wrap
        head={["Tip glagola", "Obrazac", "Primeri", "srpski"]}
        rows={[
          [
            "slabi (pravilni)",
            "*ge* + osnova + *t*",
            "machen → *ge*mach*t*; arbeiten → *ge*arbeite*t*",
            "praviti → napravio; raditi → radio",
          ],
          [
            "jaki (nepravilni)",
            "*ge* + osnova (često promenjena) + *en*",
            "sprechen → *ge*sproch*en*; fahren → *ge*fahr*en*",
            "govoriti → govorio; voziti → vozio",
          ],
          [
            "neodvojivi prefiks",
            "*bez ge-*",
            "besuchen → besuch*t*; verstehen → verstand*en*",
            "posetiti → posetio; razumeti → razumeo",
          ],
          [
            "odvojivi prefiks",
            "prefiks + *ge* + ostatak",
            "aufstehen → auf*ge*standen; einkaufen → ein*ge*kauft",
            "ustati → ustao; kupovati → kupovao",
          ],
          [
            "glagoli na -ieren",
            "*bez ge-*",
            "studieren → studier*t*; passieren → passier*t*",
            "studirati → studirao; desiti se → desilo se",
          ],
        ]}
      />
    </Block>

    <Block title="haben ili sein">
      <P>
        Većina glagola ide sa *haben*. Sa *sein* idu tri grupe, i one se uče kao
        izuzeci.
      </P>
      <GTable
        wrap
        head={["Grupa", "Glagoli", "Primer", "srpski"]}
        rows={[
          [
            "kretanje s mesta na mesto",
            "gehen, fahren, kommen, laufen, fliegen, reisen, steigen, fallen",
            "Ich *bin* nach Hause *gegangen*.",
            "Otišao sam kući.",
          ],
          [
            "promena stanja",
            "aufstehen, einschlafen, aufwachen, sterben, wachsen, werden",
            "Er *ist* früh *aufgestanden*.",
            "Rano je ustao.",
          ],
          [
            "posebni glagoli",
            "sein, bleiben, passieren, geschehen, gelingen, begegnen",
            "Was *ist* *passiert*?",
            "Šta se desilo?",
          ],
        ]}
      />
      <Note title="Pazi" tone="warn">
        Ako glagol kretanja ima direktan objekat, ide sa haben: Ich *bin*
        gefahren, ali Ich *habe* das Auto gefahren.
      </Note>
      <Note title="U Austriji" tone="austria">
        sitzen, stehen i liegen u Austriji i južnoj Nemačkoj idu sa *sein*: Ich
        *bin* gesessen, ich *bin* gestanden, ich *bin* gelegen. U severnoj
        Nemačkoj se za iste glagole kaže ich *habe* gesessen. Oba su ispravna,
        samo pripadaju različitim područjima.
      </Note>
    </Block>
  </Section>
);

const PRETERITE = () => (
  <Section
    title="Präteritum"
    lead="Prošlo vreme pisanog nemačkog, i jedino prošlo vreme koje se za sein, haben i modalne glagole koristi i u govoru."
  >
    <Block title="Kada se koristi">
      <GTable
        wrap
        head={["Situacija", "Primer", "srpski"]}
        rows={[
          ["priče, romani, vesti", "Er *ging* nach Hause.", "Otišao je kući."],
          ["formalno pisanje i izveštaji", "Die Firma *stellte* zehn Leute ein.", "Firma je zaposlila deset ljudi."],
          [
            "sein, haben i modali, i u govoru",
            "Ich *war* müde. Ich *hatte* keine Zeit.",
            "Bio sam umoran. Nisam imao vremena.",
          ],
          [
            "uz Plusquamperfekt, kao kasnija radnja",
            "Nachdem er gegessen hatte, *ging* er.",
            "Nakon što je jeo, otišao je.",
          ],
        ]}
      />
      <Note title="U govoru" tone="tip">
        Ako nisi siguran, u razgovoru uzmi Perfekt. Präteritum od običnih glagola
        (ich arbeitete) u govoru zvuči knjiški.
      </Note>
      <Note title="U Austriji" tone="austria">
        Präteritum se u govoru gotovo i ne čuje, više nego u Nemačkoj. Čak i
        war i hatte često ustupe mesto Perfektu: *ich bin gewesen*, *ich habe
        gehabt*. U pisanju ostaje isto pravilo kao svuda.
      </Note>
    </Block>

    <Block title="Nastavci">
      <GTable
        head={[
          "Lice",
          "machen (slab)",
          "gehen (jak)",
          "sein",
          "haben",
          "können",
        ]}
        rows={[
          ["ich", "mach*te*", "ging", "war", "hatte", "konnte"],
          ["du", "mach*test*", "ging*st*", "war*st*", "hatte*st*", "konnte*st*"],
          ["er / sie / es", "mach*te*", "ging", "war", "hatte", "konnte"],
          ["wir", "mach*ten*", "ging*en*", "war*en*", "hatte*n*", "konnte*n*"],
          ["ihr", "mach*tet*", "ging*t*", "war*t*", "hatte*t*", "konnte*t*"],
          ["sie / Sie", "mach*ten*", "ging*en*", "war*en*", "hatte*n*", "konnte*n*"],
        ]}
      />
      <P>
        Prvo i treće lice jednine su *ista* u svim vremenima osim Präsensa, a u
        Präsensu se poklapaju kod modalnih glagola (ich kann, er kann). Modali u Präteritumu gube Umlaut: können → konnte, müssen →
        musste, dürfen → durfte, mögen → mochte.
      </P>
    </Block>

    <Block title="Najčešći nepravilni glagoli">
      <GTable
        head={["Infinitiv", "Präteritum", "Partizip II", "srpski"]}
        rows={[
          ["sein", "war", "ist gewesen", "biti"],
          ["haben", "hatte", "hat gehabt", "imati"],
          ["werden", "wurde", "ist geworden", "postati"],
          ["gehen", "ging", "ist gegangen", "ići"],
          ["kommen", "kam", "ist gekommen", "doći"],
          ["fahren", "fuhr", "ist gefahren", "voziti se"],
          ["sehen", "sah", "hat gesehen", "videti"],
          ["essen", "aß", "hat gegessen", "jesti"],
          ["trinken", "trank", "hat getrunken", "piti"],
          ["sprechen", "sprach", "hat gesprochen", "govoriti"],
          ["schreiben", "schrieb", "hat geschrieben", "pisati"],
          ["lesen", "las", "hat gelesen", "čitati"],
          ["nehmen", "nahm", "hat genommen", "uzeti"],
          ["geben", "gab", "hat gegeben", "dati"],
          ["finden", "fand", "hat gefunden", "naći"],
          ["bleiben", "blieb", "ist geblieben", "ostati"],
          ["schlafen", "schlief", "hat geschlafen", "spavati"],
          ["helfen", "half", "hat geholfen", "pomoći"],
          ["treffen", "traf", "hat getroffen", "sresti"],
          ["denken", "dachte", "hat gedacht", "misliti"],
          ["bringen", "brachte", "hat gebracht", "doneti"],
          ["wissen", "wusste", "hat gewusst", "znati"],
          ["stehen", "stand", "hat gestanden", "stajati"],
          ["verstehen", "verstand", "hat verstanden", "razumeti"],
          ["laufen", "lief", "ist gelaufen", "trčati"],
          ["fliegen", "flog", "ist geflogen", "leteti"],
          ["ziehen", "zog", "hat gezogen", "vući"],
          ["heißen", "hieß", "hat geheißen", "zvati se"],
          ["tun", "tat", "hat getan", "činiti"],
          ["rufen", "rief", "hat gerufen", "zvati"],
        ]}
      />
      <Note title="Mešoviti glagoli" tone="compare">
        denken, bringen i wissen menjaju samoglasnik kao jaki, ali uzimaju
        nastavak -te i particip na -t kao slabi: denken → dachte → gedacht.
      </Note>
    </Block>
  </Section>
);

const PLUPERFECT = () => (
  <Section
    title="Plusquamperfekt"
    lead="Pretprošlo vreme. Postoji da bi se od dve prošle radnje jasno videlo koja je bila prva."
  >
    <Block title="Kada se koristi">
      <Formula>*hatte* ili *war* + Partizip II na kraju</Formula>
      <Bullets
        items={[
          "Radnja koja se desila *pre* neke druge prošle radnje.",
          "Skoro uvek stoji uz *nachdem*, i tada druga rečenica ide u Präteritum ili Perfekt.",
          "Gradi se kao Perfekt, samo je pomoćni glagol u Präteritumu: hatte umesto habe, war umesto bin.",
        ]}
      />
      <GTable
        wrap
        head={["Perfekt", "Plusquamperfekt", "srpski"]}
        rows={[
          ["ich *habe* gearbeitet", "ich *hatte* gearbeitet", "radio sam → bio sam radio"],
          ["ich *bin* gegangen", "ich *war* gegangen", "otišao sam → bio sam otišao"],
        ]}
      />
      <Examples
        items={[
          [
            "*Nachdem* ich gegessen *hatte*, ging ich schlafen.",
            "Nakon što sam jeo, otišao sam da spavam.",
          ],
          [
            "Der Zug *war* schon *abgefahren*, als wir ankamen.",
            "Voz je već bio otišao kad smo stigli.",
          ],
          [
            "Sie *hatte* den Film schon *gesehen*, deshalb blieb sie zu Hause.",
            "Već je bila pogledala film, zato je ostala kod kuće.",
          ],
        ]}
      />
      <Note title="nachdem i bevor" tone="compare">
        Uz *nachdem* ranija radnja ide u Plusquamperfekt. Uz *bevor* oba dela
        ostaju u istom vremenu: *Bevor* ich ging, rief ich an.
      </Note>
    </Block>
  </Section>
);

const FUTURE = () => (
  <Section
    title="Futur"
    lead="Nemački retko mora da koristi buduće vreme, jer Präsens uz vremensku odredbu već znači budućnost. Futur se zato češće koristi za nameru i za nagađanje."
  >
    <Block title="Futur I">
      <Formula>*werden* (po licu) + Infinitiv na kraju</Formula>
      <GTable
        wrap
        head={["Upotreba", "Primer", "srpski"]}
        rows={[
          [
            "obećanje ili čvrsta namera",
            "Ich *werde* dich morgen *anrufen*.",
            "Nazvaću te sutra.",
          ],
          [
            "predviđanje",
            "Es *wird* bald *regnen*.",
            "Uskoro će padati kiša.",
          ],
          [
            "pretpostavka o sadašnjosti",
            "Er *wird* wohl krank *sein*.",
            "Verovatno je bolestan.",
          ],
        ]}
      />
      <GTable
        head={["Lice", "werden"]}
        rows={[
          ["ich", "werde"],
          ["du", "wirst"],
          ["er / sie / es", "wird"],
          ["wir", "werden"],
          ["ihr", "werdet"],
          ["sie / Sie", "werden"],
        ]}
      />
    </Block>

    <Block title="Futur II">
      <Formula>*werden* + Partizip II + *haben* ili *sein*</Formula>
      <P>
        Retko se koristi, i skoro uvek znači pretpostavku o nečemu što je već
        prošlo, a ne pravu budućnost.
      </P>
      <Examples
        items={[
          [
            "Sie *wird* den Zug *verpasst haben*.",
            "Verovatno je propustila voz.",
          ],
          [
            "Er *wird* schon nach Hause *gegangen sein*.",
            "Verovatno je već otišao kući.",
          ],
          [
            "Bis morgen *werde* ich alles *erledigt haben*.",
            "Do sutra ću sve završiti.",
            "prava budućnost",
          ],
        ]}
      />
    </Block>

    <Block title="Kad Futur nije potreban">
      <Examples
        items={[
          [
            "Morgen *fahre* ich nach Berlin.",
            "Sutra idem u Berlin.",
            "Präsens je dovoljan",
          ],
          [
            "Nächste Woche *fängt* der Kurs *an*.",
            "Sledeće nedelje počinje kurs.",
            "Präsens je dovoljan",
          ],
        ]}
      />
      <Note title="Pretpostavka" tone="tip">
        Uz wohl, sicher i wahrscheinlich Futur skoro uvek znači pretpostavku, a
        ne budućnost.
      </Note>
    </Block>
  </Section>
);

const PASSIVE = () => (
  <Section
    title="Pasiv"
    lead="U aktivu je važno ko radi. U pasivu je važna sama radnja, a vršilac često nestaje. Nemački ga koristi mnogo više nego srpski, u uputstvima, pravilima, vestima i formalnom pisanju."
  >
    <Block title="Kada se koristi">
      <GTable
        wrap
        head={["Situacija", "Zašto pasiv", "Primer", "srpski"]}
        rows={[
          [
            "uputstva i pravila",
            "bitno je šta se radi, ne ko radi",
            "Das Formular *wird* online *ausgefüllt*.",
            "Formular se popunjava onlajn.",
          ],
          [
            "vesti i izveštaji",
            "vršilac je nepoznat ili nevažan",
            "Das Museum *wurde* 1890 *gebaut*.",
            "Muzej je izgrađen 1890.",
          ],
          [
            "procesi i postupci",
            "opisuje se tok, ne izvođač",
            "Zuerst *werden* die Eier *geschlagen*.",
            "Prvo se umute jaja.",
          ],
          [
            "kad ne želiš da prozivaš",
            "izbegava se „ti si“",
            "Hier *wird* nicht *geraucht*.",
            "Ovde se ne puši.",
          ],
          [
            "formalno pisanje",
            "zvuči neutralno i zvanično",
            "Ihr Antrag *wird* geprüft.",
            "Vaš zahtev se razmatra.",
          ],
        ]}
      />
      <Note title="U govoru" tone="tip">
        U svakodnevnom razgovoru se umesto pasiva često kaže *man*: Man
        repariert das Auto. Pasiv drži za pisanje, uputstva i ispit.
      </Note>
    </Block>

    <Block title="Kako se pravi">
      <Formula>*werden* (menja se po licu i vremenu) + *Partizip II* na kraju</Formula>
      <P>
        Akkusativ objekat iz aktiva postaje subjekat u nominativu. Vršilac se
        dodaje sa *von + Dativ* (osoba) ili *durch + Akkusativ* (sredstvo,
        uzrok), ili se izostavi, što je i najčešće.
      </P>
      <Examples
        items={[
          ["Der Mechaniker repariert *das Auto*.", "Mehaničar popravlja auto.", "Aktiv"],
          ["*Das Auto* wird (*vom* Mechaniker) repariert.", "Auto se popravlja (od strane mehaničara).", "Pasiv"],
        ]}
      />
    </Block>

    <Block title="Pasiv kroz vremena">
      <GTable
        wrap
        head={["Vreme", "Oblik", "Primer", "srpski"]}
        rows={[
          ["Präsens", "wird + Partizip II", "Das Haus *wird gebaut*.", "Kuća se gradi."],
          ["Präteritum", "wurde + Partizip II", "Das Haus *wurde gebaut*.", "Kuća se gradila."],
          ["Perfekt", "ist + Partizip II + *worden*", "Das Haus *ist gebaut worden*.", "Kuća je izgrađena."],
          ["Plusquamperfekt", "war + Partizip II + *worden*", "Das Haus *war gebaut worden*.", "Kuća je bila izgrađena."],
          ["Futur I", "wird + Partizip II + *werden*", "Das Haus *wird gebaut werden*.", "Kuća će se graditi."],
        ]}
      />
      <Note title="Zamka" tone="trap">
        U pasivnom Perfektu ide *worden*, ne geworden. geworden pripada glagolu
        werden u značenju „postati“: Er ist Arzt *geworden*.
      </Note>
    </Block>

    <Block title="Pasiv sa modalnim glagolom">
      <Formula>modal + *Partizip II* + *werden*</Formula>
      <Examples
        items={[
          ["Das Auto *muss repariert werden*.", "Auto mora da se popravi."],
          ["Die Rechnung *kann* online *bezahlt werden*.", "Račun može da se plati onlajn."],
          ["Der Antrag *musste* neu *geschrieben werden*.", "Zahtev je morao ponovo da se napiše."],
          ["Ich weiß, dass das Auto repariert werden *muss*.", "Znam da auto mora da se popravi."],
        ]}
      />
    </Block>

    <Cols>
      <Block title="Bezlični pasiv">
        <P>
          Glagoli bez Akkusativ objekta ipak mogu u pasiv, samo bez pravog subjekta.
          Ako rečenica počinje nečim drugim, es nestaje.
        </P>
        <Examples
          items={[
            ["*Es wird* getanzt.", "Igra se."],
            ["Hier *wird* nicht *geraucht*.", "Ovde se ne puši."],
            ["Am Wochenende *wird* viel *gearbeitet*.", "Vikendom se mnogo radi."],
          ]}
        />
        <Note title="Dativ ostaje" tone="rule">
          Dativ objekat *ostaje* dativ i u pasivu: Man hilft *mir*. → *Mir* wird
          geholfen.
        </Note>
      </Block>

      <Block title="Zustandspassiv (pasiv stanja)">
        <P>
          sein + Partizip II opisuje *rezultat*, a ne radnju u toku.
        </P>
        <Examples
          items={[
            ["Das Fenster *wird geöffnet*.", "Prozor se otvara.", "radnja"],
            ["Das Fenster *ist geöffnet*.", "Prozor je otvoren.", "stanje"],
            ["Das Geschäft *ist geschlossen*.", "Radnja je zatvorena."],
          ]}
        />
      </Block>
    </Cols>

    <Block title="Zamene za pasiv">
      <P>
        Na B2 se traži da isto značenje umeš da izraziš na više načina.
      </P>
      <GTable
        wrap
        head={["Konstrukcija", "Značenje", "Primer", "srpski"]}
        rows={[
          ["*man* + aktiv", "najjednostavnija zamena", "*Man* repariert das Auto.", "Auto se popravlja."],
          ["*sich lassen* + Infinitiv", "može da se uradi", "Das Auto *lässt sich* reparieren.", "Auto može da se popravi."],
          ["*sein + zu* + Infinitiv", "može ili mora da se uradi", "Das Auto *ist zu reparieren*.", "Auto treba popraviti."],
          ["pridev na *-bar*", "izvodljivo", "Das ist *machbar* / *essbar* / *lesbar*.", "To je izvodljivo / jestivo / čitljivo."],
          ["povratni glagol", "opisuje osobinu", "Das Buch *verkauft sich* gut.", "Knjiga se dobro prodaje."],
          ["*bekommen / kriegen* + Part. II", "pasiv iz ugla primaoca", "Er *bekommt* das Buch *geschenkt*.", "On dobija knjigu na poklon."],
        ]}
      />
    </Block>
  </Section>
);

const SUBJUNCTIVE = () => (
  <Section
    title="Konjunktiv"
    lead="Konjunktiv II je oblik za sve što nije stvarno: želje, uslove, savete i učtivost. Konjunktiv I je gotovo isključivo jezik novina, tuđe reči prepričane bez tvrdnje da su tačne."
  >
    <Block title="Oblici konjunktiva II">
      <P>
        Za većinu glagola koristi se *würde + Infinitiv*. Sopstveni oblik čuva
        samo mala grupa najčešćih glagola, i njih vredi znati.
      </P>
      <GTable
        head={["Infinitiv", "Präteritum", "Konjunktiv II", "srpski"]}
        rows={[
          ["sein", "war", "*wäre*", "bio bih"],
          ["haben", "hatte", "*hätte*", "imao bih"],
          ["werden", "wurde", "*würde*", "postao bih"],
          ["können", "konnte", "*könnte*", "mogao bih"],
          ["müssen", "musste", "*müsste*", "morao bih"],
          ["dürfen", "durfte", "*dürfte*", "smeo bih"],
          ["sollen", "sollte", "*sollte*", "trebalo bi"],
          ["mögen", "mochte", "*möchte*", "želeo bih"],
          ["wissen", "wusste", "*wüsste*", "znao bih"],
          ["gehen", "ging", "*ginge*", "išao bih"],
          ["kommen", "kam", "*käme*", "došao bih"],
          ["geben", "gab", "*gäbe*", "dao bih"],
          ["finden", "fand", "*fände*", "našao bih"],
        ]}
      />
      <Note title="Obrazac" tone="tip">
        Obrazac: uzmeš Präteritum, dodaš Umlaut i -e. Kod slabih glagola to daje
        oblik identičan Präteritumu (machte = machte), pa se tu uvek koristi
        würde: ich *würde* das machen.
      </Note>
    </Block>

    <Block title="Kada se koristi">
      <GTable
        wrap
        head={["Upotreba", "Primer", "srpski"]}
        rows={[
          ["nestvarna želja", "*Wenn* ich doch mehr Zeit *hätte*!", "Kad bih bar imao više vremena!"],
          ["nestvarni uslov", "*Wenn* ich Zeit *hätte*, *würde* ich kommen.", "Da imam vremena, došao bih."],
          ["učtiva molba", "*Könnten* Sie mir bitte helfen?", "Da li biste mogli da mi pomognete?"],
          ["učtiva želja", "Ich *hätte* gern einen Kaffee.", "Želeo bih kafu."],
          ["savet", "An deiner Stelle *würde* ich bleiben.", "Na tvom mestu bih ostao."],
          ["savet (blaži)", "Du *solltest* mehr schlafen.", "Trebalo bi više da spavaš."],
          ["pretpostavka", "Das *könnte* stimmen.", "To bi moglo da bude tačno."],
          ["poređenje", "Er tut so, *als ob* er alles *wüsste*.", "Pravi se kao da sve zna."],
        ]}
      />
    </Block>

    <Block title="Konjunktiv II u prošlosti">
      <P>
        Postoji samo jedan oblik za svu prošlost: *hätte* ili *wäre* +
        Partizip II. Koristi se za ono što se moglo desiti, a nije.
      </P>
      <Examples
        items={[
          [
            "Wenn ich Zeit *gehabt hätte*, *wäre* ich *gekommen*.",
            "Da sam imao vremena, došao bih (ali nisam).",
          ],
          ["Ich *hätte* dir *helfen können*.", "Mogao sam da ti pomognem."],
          ["Du *hättest* mich *anrufen sollen*.", "Trebalo je da me nazoveš."],
        ]}
      />
      <Note title="Red reči" tone="rule">
        Sa modalom u prošlosti idu *dva infinitiva* na kraju, a pomoćni glagol
        stoji ispred njih: ... *hätte* kommen können.
      </Note>
    </Block>

    <Block title="Konjunktiv I i indirektni govor">
      <P>
        Novinarski oblik: prenosiš tuđe reči bez tvrdnje da su istinite. Gradi
        se od infinitivne osnove + *-e* u trećem licu.
      </P>
      <GTable
        head={["Glagol", "srpski", "Präsens", "Konjunktiv I"]}
        rows={[
          ["sein", "biti", "er ist", "er *sei*"],
          ["haben", "imati", "er hat", "er *habe*"],
          ["kommen", "doći", "er kommt", "er *komme*"],
          ["können", "moći", "er kann", "er *könne*"],
          ["werden", "postati", "er wird", "er *werde*"],
          ["množina", "oni imaju", "sie haben", "sie *hätten* → Konjunktiv II"],
        ]}
      />
      <Note title="Pravilo zamene" tone="rule">
        Ako je Konjunktiv I isti kao Präsens (sie haben = sie haben), koristi se
        Konjunktiv II (sie hätten). Zato u trećem licu množine skoro uvek vidiš
        Konjunktiv II.
      </Note>
      <Examples
        items={[
          [
            "Der Minister sagte, er *sei* zufrieden.",
            "Ministar je rekao da je zadovoljan.",
          ],
          [
            "Sie behauptet, sie *habe* nichts gewusst.",
            "Ona tvrdi da nije ništa znala.",
          ],
        ]}
      />
    </Block>
  </Section>
);

const WORD_ORDER = () => (
  <Section
    title="Red reči"
    lead="Nemački red reči drži jedno pravilo: u izjavnoj rečenici glagol je na drugom mestu, a sve što od glagola preostane ide na kraj. Između ta dva mesta je slobodna sredina."
  >
    <Block title="Glagolska zagrada">
      <P>
        Prvi deo glagola stoji na drugom mestu, drugi deo (infinitiv, particip,
        odvojivi prefiks) na kraju. Sve ostalo je zatvoreno između njih.
      </P>
      <GTable
        wrap
        head={["1. mesto", "2. mesto (glagol)", "sredina", "kraj"]}
        rows={[
          ["Ich", "*fahre*", "morgen nach Berlin", "—"],
          ["*Morgen*", "*fahre*", "ich", "nach Berlin"],
          ["Ich", "*habe*", "gestern viel", "*gearbeitet*"],
          ["Ich", "*will*", "dich morgen", "*anrufen*"],
          ["Heute", "*rufe*", "ich dich", "*an*"],
          ["Das Auto", "*muss*", "heute", "*repariert werden*"],
        ]}
      />
      <Note title="Prvo mesto" tone="rule">
        Na prvom mestu stoji *tačno jedan* element: subjekat, vremenska
        odredba, cela zavisna rečenica, bilo šta. Čim tu nije subjekat, subjekat
        se seli odmah iza glagola.
      </Note>
    </Block>

    <Block title="Tri tipa rečenice">
      <GTable
        wrap
        head={["Tip", "Gde je glagol", "Primer", "srpski"]}
        rows={[
          ["izjava", "2. mesto", "Er *kommt* heute.", "On danas dolazi."],
          ["W-pitanje", "2. mesto, iza upitne reči", "Wann *kommt* er?", "Kada dolazi?"],
          ["ja/ne pitanje", "*1. mesto*", "*Kommt* er heute?", "Da li danas dolazi?"],
          ["imperativ", "*1. mesto*", "*Komm* her!", "Dođi ovamo!"],
          ["zavisna rečenica", "*na kraju*", "..., weil er heute *kommt*.", "..., jer danas dolazi."],
        ]}
      />
    </Block>

    <Block title="Upitne reči">
      <GTable
        wrap
        head={["Reč", "Značenje", "Primer", "srpski"]}
        rows={[
          ["wer / wen / wem / wessen", "ko / koga / kome / čiji", "*Wem* gehört das?", "Kome ovo pripada?"],
          ["was", "šta", "*Was* machst du?", "Šta radiš?"],
          ["wo / wohin / woher", "gde / kuda / odakle", "*Woher* kommst du?", "Odakle si?"],
          ["wann / seit wann / bis wann", "kada / otkad / dokad", "*Wann* fängt es an?", "Kada počinje?"],
          ["wie / wie lange / wie oft / wie viel", "kako / koliko dugo / koliko često / koliko", "*Wie lange* dauert das?", "Koliko dugo to traje?"],
          ["warum / wieso / weshalb", "zašto", "*Warum* lachst du?", "Zašto se smeješ?"],
          ["welcher, welche, welches", "koji (bira iz grupe)", "*Welches* Buch liest du?", "Koju knjigu čitaš?"],
          ["was für ein", "kakav", "*Was für ein* Auto hast du?", "Kakav auto imaš?"],
        ]}
      />
    </Block>

    <Block title="Sredina rečenice i redosled objekata">
      <GTable
        wrap
        head={["Situacija", "Pravilo", "Primer", "srpski"]}
        rows={[
          ["dve imenice", "Dativ pre Akkusativa", "Ich gebe *dem Kind das Buch*.", "Dajem detetu knjigu."],
          ["imenica + zamenica", "zamenica prva, bez obzira na padež", "Ich gebe *ihm* das Buch. / Ich gebe *es* dem Kind.", "Dajem mu knjigu. / Dajem je detetu."],
          ["dve zamenice", "Akkusativ pre Dativa", "Ich gebe *es ihm*.", "Dajem mu je."],
          ["odredbe", "TeKaMoLo: vreme, razlog, način, mesto", "Ich fahre *morgen mit dem Auto nach Wien*.", "Sutra idem kolima u Beč."],
        ]}
      />
    </Block>

    <Block title="Negacija">
      <P>
        *kein-* negira imenicu koja ima neodređeni član ili nema član.
        *nicht* negira sve ostalo.
      </P>
      <Examples
        items={[
          ["Ich habe *kein* Auto.", "Nemam auto."],
          ["Ich habe *keine* Zeit.", "Nemam vremena."],
          ["Das ist *nicht* mein Auto.", "To nije moj auto, jer uz prisvojnu zamenicu ide nicht."],
        ]}
      />
      <P>
        Kad negiraš celu rečenicu, nicht ide *na kraj*, ali ispred svega što
        pripada glagolskoj zagradi ili se posebno negira.
      </P>
      <GTable
        wrap
        head={["nicht stoji ispred", "Primer", "srpski"]}
        rows={[
          ["participa i infinitiva", "Ich habe ihn *nicht* gesehen.", "Nisam ga video."],
          ["odvojivog prefiksa", "Ich rufe dich *nicht* an.", "Ne zovem te."],
          ["prideva i priloga", "Das Buch ist *nicht* interessant.", "Knjiga nije zanimljiva."],
          ["predloške dopune", "Ich warte *nicht* auf dich.", "Ne čekam te."],
          ["dela rečenice koji se poredi", "Ich fahre *nicht* nach Berlin, sondern nach Wien.", "Ne idem u Berlin nego u Beč."],
          ["ničega, na samom kraju", "Ich kenne ihn *nicht*.", "Ne poznajem ga."],
        ]}
      />
    </Block>
  </Section>
);

const CLAUSES = () => (
  <Section
    title="Zavisne rečenice i veznici"
    lead="Zavisna rečenica drži jedno pravilo: glagol ide na sam kraj, a ako ih ima više, poslednji je onaj koji se menja po licu. Koji veznik šta radi sa glagolom je na dnu oblasti."
  >
    <Block title="Osnovni obrazac">
      <Formula>veznik + subjekat + ostalo + *glagol na kraju*</Formula>
      <Examples
        items={[
          ["Ich bleibe zu Hause, *weil* ich krank *bin*.", "Ostajem kod kuće jer sam bolestan."],
          ["Ich weiß, *dass* er morgen *arbeiten muss*.", "Znam da sutra mora da radi."],
          ["Er sagt, *dass* er viel *gearbeitet hat*.", "Kaže da je mnogo radio."],
          ["*Weil* ich krank *bin*, bleibe ich zu Hause.", "Pošto sam bolestan, ostajem kod kuće."],
        ]}
      />
      <Note title="Kad zavisna ide prva" tone="rule">
        Cela zavisna rečenica broji se kao *prvo mesto*, pa glavni glagol dolazi
        odmah iza zapete: ..., *bleibe* ich zu Hause. Dva glagola se sudare u
        sredini, i to je normalno.
      </Note>
      <Note title="Jedini izuzetak" tone="trap">
        Kad se na kraju nađu *dva infinitiva*, pomoćni glagol preskače ispred
        njih: ..., dass er *hätte* kommen können, a ne „kommen können hätte“.
        Isto važi i za modal u Perfektu: ..., weil er *hat* arbeiten müssen.
      </Note>
    </Block>

    <Block title="Veznici zavisnih rečenica">
      <GTable
        wrap
        head={["Veznik", "Značenje", "Primer", "srpski"]}
        rows={[
          ["dass", "da", "Ich hoffe, *dass* du kommst.", "Nadam se da dolaziš."],
          ["ob", "da li", "Ich weiß nicht, *ob* er kommt.", "Ne znam da li dolazi."],
          ["weil", "jer (odgovor na warum)", "Ich gehe, *weil* es spät ist.", "Idem jer je kasno."],
          ["da", "pošto (razlog već poznat)", "*Da* es regnet, bleiben wir hier.", "Pošto pada kiša, ostajemo ovde."],
          ["obwohl", "iako", "*Obwohl* es regnet, gehe ich raus.", "Iako pada kiša, izlazim."],
          ["wenn", "ako / kad (sada, buduće, ponovljeno)", "*Wenn* ich Zeit habe, komme ich.", "Ako budem imao vremena, doći ću."],
          ["als", "kad (jednom u prošlosti)", "*Als* ich Kind war, wohnte ich dort.", "Kad sam bio dete, živeo sam tamo."],
          ["während", "dok (istovremeno) / dok (suprotnost)", "*Während* ich koche, liest er.", "Dok ja kuvam, on čita."],
          ["bevor", "pre nego što", "*Bevor* du gehst, ruf mich an.", "Pre nego što odeš, nazovi me."],
          ["nachdem", "nakon što", "*Nachdem* er gegessen hatte, ging er.", "Nakon što je jeo, otišao je."],
          ["seitdem", "otkako", "*Seitdem* er hier ist, geht alles besser.", "Otkako je on tu, sve ide bolje."],
          ["bis", "dok ne", "Warte, *bis* ich fertig bin.", "Čekaj dok ne završim."],
          ["sobald", "čim", "*Sobald* ich ankomme, rufe ich an.", "Čim stignem, javiću se."],
          ["damit", "da bi (različit subjekat)", "Ich erkläre es, *damit* du es verstehst.", "Objašnjavam da bi ti razumeo."],
          ["sodass", "tako da (posledica)", "Er sprach leise, *sodass* ich nichts hörte.", "Govorio je tiho, tako da ništa nisam čuo."],
          ["falls", "ukoliko", "*Falls* es regnet, bleiben wir hier.", "Ukoliko pada kiša, ostajemo ovde."],
          ["indem", "tako što (način)", "Man lernt, *indem* man übt.", "Uči se tako što se vežba."],
          ["je ... desto", "što ... to", "*Je* mehr ich übe, *desto* besser werde ich.", "Što više vežbam, to sam bolji."],
        ]}
      />
      <Note title="wenn, als ili wann" tone="compare">
        *als* označava jednokratnu radnju u prošlosti. *wenn* pokriva
        sadašnjost, budućnost i ponovljenu prošlost (immer wenn). *wann* ide
        samo u pitanju i u indirektnom pitanju.
      </Note>
    </Block>

    <Block title="Relativne rečenice">
      <P>
        Relativna zamenica uzima *rod i broj* od imenice na koju se odnosi, a
        *padež* od svoje uloge unutar relativne rečenice.
      </P>
      <GTable
        head={["", "muški", "ženski", "srednji", "množina"]}
        rows={[
          ["Nominativ", "der", "die", "das", "die"],
          ["Akkusativ", "*den*", "die", "das", "die"],
          ["Dativ", "*dem*", "*der*", "*dem*", "*denen*"],
          ["Genitiv", "*dessen*", "*deren*", "*dessen*", "*deren*"],
        ]}
      />
      <Examples
        items={[
          ["Der Mann, *der* dort steht, ist mein Chef.", "Čovek koji tamo stoji je moj šef.", "Nominativ"],
          ["Der Mann, *den* ich gestern traf, ist Arzt.", "Čovek koga sam juče sreo je lekar.", "Akkusativ"],
          ["Der Mann, *dem* ich geholfen habe, dankte mir.", "Čovek kome sam pomogao mi je zahvalio.", "Dativ"],
          ["Der Mann, *dessen* Auto kaputt ist, wartet.", "Čovek čiji je auto pokvaren čeka.", "Genitiv"],
          ["Der Kollege, *mit dem* ich arbeite, ist nett.", "Kolega sa kojim radim je fin.", "predlog ispred"],
          ["Die Stadt, *in der* ich wohne, ist klein.", "Grad u kom živim je mali."],
        ]}
      />
      <Note title="was i wo" tone="rule">
        *was* se koristi posle alles, etwas, nichts, das i posle poimeničenog
        superlativa: Das ist alles, *was* ich weiß. *wo* zamenjuje mesto: die
        Stadt, *wo* ich wohne.
      </Note>
    </Block>

    <Block title="Infinitivne rečenice sa zu">
      <P>
        Kad je subjekat isti u oba dela rečenice, umesto dass ide infinitiv sa
        zu. Kod odvojivih glagola zu ide u sredinu: an*zu*rufen.
      </P>
      <GTable
        wrap
        head={["Konstrukcija", "Značenje", "Primer", "srpski"]}
        rows={[
          ["glagol + zu + Infinitiv", "posle versuchen, vergessen, hoffen, planen, anfangen, aufhören, beschließen", "Ich versuche, früh *aufzustehen*.", "Pokušavam da rano ustanem."],
          ["izraz + zu + Infinitiv", "posle Lust haben, Zeit haben, es ist wichtig / schwer / schön", "Es ist wichtig, jeden Tag *zu üben*.", "Važno je vežbati svaki dan."],
          ["*um ... zu*", "da bi (isti subjekat, cilj)", "Ich lerne, *um* die Prüfung *zu bestehen*.", "Učim da bih položio ispit."],
          ["*ohne ... zu*", "bez da", "Er ging, *ohne* etwas *zu sagen*.", "Otišao je ne rekavši ništa."],
          ["*(an)statt ... zu*", "umesto da", "*Statt* zu arbeiten, schläft er.", "Umesto da radi, spava."],
        ]}
      />
      <Note title="Bez zu" tone="rule">
        Posle modalnih glagola i posle sehen, hören, lassen, gehen, bleiben,
        werden infinitiv ide *bez* zu: Ich *lasse* das Auto *reparieren*. Ich
        *gehe* schwimmen.
      </Note>
      <Examples
        items={[
          ["Ich lerne, *um* die Prüfung zu bestehen.", "Učim da bih položio ispit.", "isti subjekat"],
          ["Ich erkläre es, *damit* du es verstehst.", "Objašnjavam da bi ti razumeo.", "drugi subjekat"],
        ]}
      />
    </Block>

    <Block title="Indirektna pitanja">
      <P>
        Pitanje ubačeno u rečenicu gubi upitni red reči i dobija glagol na
        kraju. Ako nema upitne reči, uvodi ga *ob*.
      </P>
      <Examples
        items={[
          ["Wann kommt er? → Ich weiß nicht, *wann* er *kommt*.", "Ne znam kada dolazi."],
          ["Kommt er? → Ich weiß nicht, *ob* er *kommt*.", "Ne znam da li dolazi."],
          ["Können Sie mir sagen, *wo* der Bahnhof *ist*?", "Možete li mi reći gde je stanica?"],
        ]}
      />
    </Block>
    <Block title="Tri grupe">
      <GTable
        wrap
        head={["Grupa", "Šta radi glagol", "Veznici"]}
        rows={[
          [
            "*pozicija 0*",
            "ništa, red reči ostaje normalan",
            "und, aber, oder, denn, sondern",
          ],
          [
            "*pozicija 1*",
            "glagol dolazi odmah iza veznika (inverzija)",
            "deshalb, deswegen, darum, daher, trotzdem, dann, danach, außerdem, sonst, also, jedoch, dennoch, folglich, stattdessen, zudem",
          ],
          [
            "*zavisna rečenica*",
            "glagol ide na kraj",
            "weil, da, obwohl, dass, ob, wenn, als, während, bevor, nachdem, damit, sodass, falls, indem, bis, seitdem",
          ],
        ]}
      />
      <Examples
        items={[
          ["Es regnet, *aber* ich gehe raus.", "Pada kiša, ali izlazim.", "pozicija 0"],
          ["Es regnet, *trotzdem* gehe ich raus.", "Pada kiša, ipak izlazim.", "inverzija"],
          ["*Obwohl* es regnet, gehe ich raus.", "Iako pada kiša, izlazim.", "glagol na kraju"],
        ]}
      />
    </Block>

    <Block title="Parovi koji se mešaju">
      <GTable
        wrap
        head={["Par", "Razlika", "Primer", "srpski"]}
        rows={[
          ["denn / weil", "isto značenje, drugi red reči", "Ich bleibe, *denn* ich *bin* müde. / ..., *weil* ich müde *bin*.", "Ostajem, jer sam umoran."],
          ["aber / sondern", "sondern samo posle negacije, kao ispravka", "Nicht heute, *sondern* morgen.", "Ne danas, nego sutra."],
          ["weil / deshalb", "weil daje razlog, deshalb posledicu", "Ich bleibe, *weil* es regnet. / Es regnet, *deshalb* bleibe ich.", "Ostajem jer pada kiša. / Pada kiša, zato ostajem."],
          ["obwohl / trotzdem", "obwohl uvodi ustupak, trotzdem posledicu", "*Obwohl* es regnet, gehe ich. / Es regnet, *trotzdem* gehe ich.", "Iako pada kiša, idem. / Pada kiša, ipak idem."],
          ["wenn / als", "wenn za sada i ponovljeno, als za jednom u prošlosti", "*Immer wenn* es regnet... / *Als* ich klein war...", "Uvek kada pada kiša... / Kad sam bio mali..."],
        ]}
      />
    </Block>

    <Block title="Parni veznici">
      <GTable
        wrap
        head={["Veznik", "Značenje", "Primer", "srpski"]}
        rows={[
          ["entweder ... oder", "ili ... ili", "*Entweder* wir fahren, *oder* wir bleiben.", "Ili idemo, ili ostajemo."],
          ["weder ... noch", "ni ... ni", "Er spricht *weder* Deutsch *noch* Englisch.", "Ne govori ni nemački ni engleski."],
          ["sowohl ... als auch", "i ... i", "Sie spricht *sowohl* Deutsch *als auch* Französisch.", "Govori i nemački i francuski."],
          ["nicht nur ... sondern auch", "ne samo ... nego i", "*Nicht nur* ich, *sondern auch* er kommt.", "Ne dolazim samo ja, nego i on."],
          ["zwar ... aber", "doduše ... ali", "Es ist *zwar* teuer, *aber* sehr gut.", "Jeste skupo, ali je vrlo dobro."],
          ["je ... desto / umso", "što ... to", "*Je* länger, *desto* besser.", "Što duže, to bolje."],
          ["einerseits ... andererseits", "s jedne strane ... s druge", "*Einerseits* mag ich es, *andererseits* ist es teuer.", "S jedne strane mi se dopada, s druge je skupo."],
        ]}
      />
    </Block>
  </Section>
);

const ADVANCED = () => (
  <Section
    title="B2: sitnice koje prave razliku"
    lead="Sve odavde je ono što odvaja tačan nemački od nemačkog koji zvuči kao nemački: particip kao pridev, imeničke konstrukcije, modali u prenesenom značenju."
  >
    <Block title="Particip kao pridev">
      <GTable
        wrap
        head={["Oblik", "Kako se gradi", "Značenje", "Primer", "srpski"]}
        rows={[
          [
            "Partizip I",
            "Infinitiv + *d*",
            "aktivno, u toku",
            "das *lachende* Kind",
            "dete koje se smeje",
          ],
          [
            "Partizip II",
            "obični particip",
            "pasivno, završeno",
            "das *gekochte* Essen",
            "skuvano jelo",
          ],
        ]}
      />
      <P>
        Oba se dekliniraju kao običan pridev. Mogu da nose i celu dopunu ispred
        sebe, što je tipično za pisani jezik.
      </P>
      <Examples
        items={[
          ["der *gestern gekaufte* Wagen", "auto kupljen juče"],
          ["die *auf dem Tisch liegenden* Bücher", "knjige koje leže na stolu"],
          ["ein *gut vorbereiteter* Vortrag", "dobro pripremljeno izlaganje"],
        ]}
      />
    </Block>

    <Block title="Modalni glagoli u prenesenom značenju">
      <P>
        Isti modali izražavaju i *koliko si siguran* u ono što tvrdiš, a ne samo
        obavezu ili mogućnost.
      </P>
      <GTable
        wrap
        head={["Oblik", "Sigurnost", "Primer", "srpski"]}
        rows={[
          ["muss", "gotovo sigurno", "Er *muss* krank sein.", "Sigurno je bolestan."],
          ["dürfte", "verovatno", "Er *dürfte* zu Hause sein.", "Verovatno je kod kuće."],
          ["könnte", "moguće", "Das *könnte* stimmen.", "Moglo bi biti tačno."],
          ["kann nicht", "isključeno", "Das *kann* nicht stimmen.", "To ne može biti tačno."],
          ["will", "on tako tvrdi za sebe", "Er *will* alles gewusst haben.", "Tvrdi da je sve znao."],
          ["soll", "tako se priča", "Er *soll* sehr reich sein.", "Kažu da je vrlo bogat."],
        ]}
      />
      <Note title="U prošlosti" tone="tip">
        Za prošlost dodaješ Infinitiv perfekta: Er *muss* krank *gewesen sein*.
      </Note>
    </Block>

    <Block title="Nominalizacija: rečenica u predlošku frazu">
      <P>
        Formalni nemački radije koristi imenicu nego zavisnu rečenicu. Ovo se
        traži na svakom B2 ispitu, u oba smera.
      </P>
      <GTable
        wrap
        head={["Zavisna rečenica", "Predloška fraza"]}
        rows={[
          ["*weil* er krank war", "*wegen* seiner Krankheit"],
          ["*obwohl* es regnete", "*trotz* des Regens"],
          ["*während* er studierte", "*während* seines Studiums"],
          ["*nachdem* er angekommen war", "*nach* seiner Ankunft"],
          ["*bevor* er abfuhr", "*vor* seiner Abfahrt"],
          ["*wenn* du ankommst", "*bei* deiner Ankunft"],
          ["*um* zu bezahlen", "*zur* Bezahlung"],
          ["*wenn* man ihn fragt", "*auf* Nachfrage"],
        ]}
      />
    </Block>

    <Block title="Nomen-Verb-Verbindungen">
      <P>
        Ustaljeni spojevi imenice i glagola. Uče se kao celina, jer se glagol ne
        bira po značenju.
      </P>
      <GTable
        wrap
        head={["Izraz", "Znači isto što i", "srpski"]}
        rows={[
          ["eine Entscheidung treffen", "entscheiden", "doneti odluku"],
          ["eine Frage stellen", "fragen", "postaviti pitanje"],
          ["in Frage stellen", "bezweifeln", "dovesti u pitanje"],
          ["zur Verfügung stehen / stellen", "verfügbar sein", "biti / staviti na raspolaganje"],
          ["Bescheid geben / wissen", "informieren / wissen", "javiti / znati"],
          ["eine Rolle spielen", "wichtig sein", "igrati ulogu"],
          ["Rücksicht nehmen auf", "berücksichtigen", "imati obzira prema"],
          ["in Kraft treten", "gelten", "stupiti na snagu"],
          ["zum Ausdruck bringen", "ausdrücken", "izraziti"],
          ["Kritik üben an", "kritisieren", "kritikovati"],
          ["Wert legen auf", "wichtig finden", "držati do"],
          ["in Betracht ziehen", "erwägen", "uzeti u obzir"],
          ["Abschied nehmen von", "sich verabschieden", "oprostiti se od"],
        ]}
      />
    </Block>

    <Block title="lassen, brauchen, sein + zu">
      <GTable
        wrap
        head={["Konstrukcija", "Značenje", "Primer", "srpski"]}
        rows={[
          ["lassen + Infinitiv", "dati da se nešto uradi", "Ich *lasse* mir die Haare *schneiden*.", "Šišam se (kod frizera)."],
          ["lassen (dozvola)", "pustiti, dozvoliti", "Meine Eltern *lassen* mich gehen.", "Roditelji me puštaju da idem."],
          ["sich lassen + Infinitiv", "može da se uradi", "Das Fenster *lässt sich* nicht öffnen.", "Prozor ne može da se otvori."],
          ["Perfekt od lassen", "dva infinitiva na kraju", "Ich *habe* die Haare schneiden *lassen*.", "Ošišao sam se."],
          ["nicht brauchen + zu", "ne moraš", "Du *brauchst* nicht *zu kommen*.", "Ne moraš da dođeš."],
          ["nur brauchen + zu", "dovoljno je da", "Du *brauchst* nur *anzurufen*.", "Dovoljno je da se javiš."],
          ["sein + zu + Infinitiv", "može ili mora da se uradi", "Das Formular *ist auszufüllen*.", "Formular treba popuniti."],
          ["haben + zu + Infinitiv", "mora (obaveza)", "Du *hast* zu warten.", "Moraš da čekaš."],
        ]}
      />
    </Block>

    <Block title="Poslednja provera pre pisanja">
      <Bullets
        items={[
          "Da li je glagol na *drugom* mestu, i da li je drugi deo glagola na *kraju*?",
          "Da li su svi članovi i pridevi u padežu koji traži glagol ili predlog?",
          "Da li je u zavisnoj rečenici glagol na kraju, i da li je zapeta tu?",
          "Da li si u Perfektu izabrao *haben* ili *sein* svesno?",
          "Da li imenica u dativu množine ima *-n*?",
          "Da li si za prošlost u govoru upotrebio Perfekt, a za sein, haben i modale Präteritum?",
        ]}
      />
    </Block>
  </Section>
);

const AUSTRIA = () => (
  <Section
    title="Austrijski nemački"
    lead="Austrijski nemački nije dijalekt nego ravnopravna varijanta standardnog jezika. Gramatika je ista, ali nekoliko pravila i podosta svakodnevnih reči stoje drugačije nego u udžbeniku pisanom u Nemačkoj."
  >
    <Block title="Gde se gramatika stvarno razlikuje">
      <GTable
        wrap
        head={["Tema", "Nemačka", "Austrija", "srpski"]}
        rows={[
          [
            "Perfekt od sitzen, stehen, liegen",
            "ich *habe* gesessen",
            "ich *bin* gesessen",
            "sedeo sam",
          ],
          [
            "Präteritum u govoru",
            "war, hatte, ging",
            "skoro uvek Perfekt: ich *bin gewesen*",
            "bio sam",
          ],
          [
            "wegen i trotz u govoru",
            "Genitiv: wegen *des* Wetters",
            "često Dativ: wegen *dem* Wetter",
            "zbog vremena",
          ],
          [
            "deminutiv",
            "-chen, -lein: das Brötchen",
            "*-erl*: das Sackerl, das Packerl",
            "kesica, paketić",
          ],
          [
            "rod nekih reči",
            "die E-Mail, die Cola, der Joghurt",
            "*das* E-Mail, *das* Cola, *das* Joghurt",
            "mejl, kola, jogurt",
          ],
          [
            "množina",
            "die Wagen",
            "često die W*ä*gen",
            "kola, vozila",
          ],
          [
            "prvi mesec",
            "Januar",
            "*Jänner*",
            "januar",
          ],
        ]}
      />
      <Note title="Nije greška" tone="austria">
        Ovo su priznati oblici austrijskog standarda, ne nemarnost. Na
        Goethe i ÖSD ispitima prolaze oba, ali ako pišeš po nemačkom udžbeniku,
        drži se oblika iz leve kolone.
      </Note>
    </Block>

    <Block title="Svakodnevne reči">
      <GTable
        wrap
        head={["Austrija", "Nemačka", "srpski"]}
        rows={[
          ["das Sackerl", "die Tüte", "kesa"],
          ["die Stiege", "die Treppe", "stepenice"],
          ["der Kasten", "der Schrank", "orman"],
          ["der Sessel", "der Stuhl", "stolica"],
          ["das Spital", "das Krankenhaus", "bolnica"],
          ["die Matura", "das Abitur", "matura"],
          ["die Trafik", "der Kiosk, der Tabakladen", "trafika"],
          ["das Gewand", "die Kleidung", "odeća"],
          ["die Kassa", "die Kasse", "kasa"],
          ["die Jause", "die Brotzeit", "užina"],
          ["die Bim (Beč, razgovorno)", "die Straßenbahn", "tramvaj"],
          ["der Bankomat", "der Geldautomat", "bankomat"],
          ["der Lift", "der Aufzug", "lift"],
        ]}
      />
      <Note title="Najopasnija zamena" tone="trap">
        *der Sessel* u Austriji je obična stolica, a u Nemačkoj fotelja. Za
        fotelju se u Austriji kaže *das Fauteuil*. Ako u Beču tražiš „einen
        Sessel“, dobićeš stolicu.
      </Note>
    </Block>

    <Block title="Hrana i kafa">
      <GTable
        wrap
        head={["Austrija", "Nemačka", "srpski"]}
        rows={[
          ["der Erdapfel", "die Kartoffel", "krompir"],
          ["der Paradeiser", "die Tomate", "paradajz"],
          ["die Marille", "die Aprikose", "kajsija"],
          ["die Semmel", "das Brötchen", "zemička"],
          ["der Karfiol", "der Blumenkohl", "karfiol"],
          ["die Fisolen", "die grünen Bohnen", "boranija"],
          ["die Melanzani", "die Aubergine", "plavi patlidžan"],
          ["der Topfen", "der Quark", "mladi sir"],
          ["das Obers, das Schlagobers", "die Sahne, die Schlagsahne", "pavlaka, šlag"],
          ["die Palatschinke", "der Pfannkuchen", "palačinka"],
          ["das Faschierte", "das Hackfleisch", "mleveno meso"],
          ["der Kren", "der Meerrettich", "ren"],
        ]}
      />
      <GTable
        wrap
        head={["Kafa", "Šta dobiješ"]}
        rows={[
          ["ein *kleiner Brauner*", "espreso sa malo mleka ili pavlake"],
          ["ein *Verlängerter*", "espreso produžen vodom"],
          ["eine *Melange*", "najbliže kapućinu, sa penom"],
          ["ein *Einspänner*", "espreso u čaši, sa šlagom"],
        ]}
      />
    </Block>

    <Block title="Pozdravi">
      <GTable
        wrap
        head={["Izraz", "Kada", "srpski"]}
        rows={[
          ["*Grüß Gott*", "formalno, pri dolasku, svuda osim Beča među mladima", "dobar dan"],
          ["*Servus*", "neformalno, i pri dolasku i pri odlasku", "zdravo, ćao"],
          ["*Grüß dich*", "neformalno, pri dolasku", "zdravo"],
          ["*Baba*, *Pfiat di*", "neformalno, pri odlasku", "ćao, prijatno"],
          ["*Mahlzeit*", "oko podneva, na poslu", "prijatno"],
          ["*Habedere*", "staromodno, šaljivo", "moje poštovanje"],
        ]}
      />
      <Note title="Tschüss" tone="austria">
        Tschüss se razume, ali zvuči severnonemački. U Austriji je prirodnije
        *Servus*, *Baba* ili *Auf Wiederschauen* (umesto Auf Wiedersehen).
      </Note>
    </Block>

    <Block title="Izrazi koje ćeš čuti samo ovde">
      <Examples
        items={[
          ["*Heuer* war der Sommer heiß.", "Ove godine je leto bilo vrelo.", "heuer = dieses Jahr"],
          [
            "Das *geht sich* nicht *aus*.",
            "To ne stiže, nema dovoljno vremena ili mesta.",
            "sich ausgehen",
          ],
          ["*Passt schon.*", "U redu je, nema veze.", "passt schon"],
          [
            "Ich habe einen Termin beim *Amt*.",
            "Imam zakazano u opštini.",
            "Amt",
          ],
        ]}
      />
    </Block>

    <Block title="Koliko je sati">
      <P>
        Ovo zbunjuje najviše: u Austriji se četvrtine broje *ka* sledećem satu,
        ne od prošlog.
      </P>
      <GTable
        wrap
        head={["Sat", "Austrija", "Nemačka (i standardno)", "srpski"]}
        rows={[
          ["16:15", "*Viertel fünf*", "Viertel nach vier", "četiri i petnaest"],
          ["16:30", "halb fünf", "halb fünf", "pola pet"],
          ["16:45", "*dreiviertel fünf*", "Viertel vor fünf", "petnaest do pet"],
        ]}
      />
      <Note title="Kako da ne pogrešiš" tone="tip">
        *halb fünf* je pola pet, ne pola šest, i to važi u celom nemačkom
        govornom području. Ako nisi siguran za četvrtine, uvek možeš reći
        *sechzehn Uhr fünfzehn* i svi će te razumeti.
      </Note>
    </Block>
  </Section>
);

export const GRAMMAR_SECTIONS: GrammarSection[] = [
  { id: "padezi", label: "Padeži", hint: "Nominativ do Genitiva", render: CASES },
  { id: "imenice", label: "Imenice", hint: "rod, množina, n-deklinacija", render: NOUNS },
  { id: "zamenice", label: "Zamenice", hint: "lične, prisvojne, povratne", render: PRONOUNS },
  { id: "pridevi", label: "Pridevi", hint: "deklinacija i nastavci", render: ADJECTIVES },
  { id: "poredjenje", label: "Poređenje", hint: "gut, besser, am besten", render: COMPARISON },
  { id: "prilozi", label: "Prilozi", hint: "vrste i TeKaMoLo", render: ADVERBS },
  { id: "predlozi", label: "Predlozi", hint: "padeži i Wechsel", render: PREPOSITIONS },
  { id: "prezent", label: "Präsens", hint: "sadašnjost i budućnost", render: PRESENT },
  { id: "glagoli", label: "Glagoli", hint: "modali, prefiksi, pregled vremena", render: VERBS },
  { id: "perfekt", label: "Perfekt", hint: "prošlost u govoru", render: PERFECT },
  { id: "preterit", label: "Präteritum", hint: "prošlost u pisanju", render: PRETERITE },
  { id: "pluskvamperfekt", label: "Plusquamperfekt", hint: "radnja pre prošle", render: PLUPERFECT },
  { id: "futur", label: "Futur", hint: "namera i pretpostavka", render: FUTURE },
  { id: "pasiv", label: "Pasiv", hint: "werden, sein, zamene", render: PASSIVE },
  { id: "konjunktiv", label: "Konjunktiv", hint: "würde, hätte, wäre", render: SUBJUNCTIVE },
  { id: "red-reci", label: "Red reči", hint: "glagolska zagrada i negacija", render: WORD_ORDER },
  { id: "zavisne", label: "Zavisne rečenice", hint: "veznici, relativne, zu", render: CLAUSES },
  { id: "b2", label: "B2 dodatno", hint: "particip, nominalizacija", render: ADVANCED },
  { id: "austrija", label: "Austrija", hint: "Jänner, Servus, Erdapfel", render: AUSTRIA },
];
