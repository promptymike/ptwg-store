import Link from "next/link";

import {
  LegalCallout,
  LegalSection,
  LegalShell,
  LegalToc,
} from "@/components/legal/legal-document";
import {
  legalSellerName,
  type LegalIdentity,
} from "@/components/legal/legal-identity";

// Final privacy policy (source: legal review, effective 2026-07-08) with two
// factual corrections vs. the reviewed draft, both flagged to the operator:
// - Supabase region is eu-north-1 (Stockholm), not eu-central-1 (Frankfurt);
// - anonymous analytics run on Plausible AND Vercel Web Analytics.
export function PolitykaPrywatnosciContent({ identity }: { identity: LegalIdentity }) {
  const SUPPORT_EMAIL = identity.supportEmail;
  const sellerName = legalSellerName(identity);

  return (
    <LegalShell
      eyebrow="Dokumenty prawne"
      title="Polityka Prywatności templify.pl"
      lead="Informacje o tym, jakie dane osobowe przetwarzamy, w jakich celach, na jakich podstawach prawnych i jakie prawa przysługują Użytkownikom Serwisu."
      effectiveDate="8 lipca 2026 r."
    >
      <LegalToc
        items={[
          { href: "#s1", num: "§1", label: "Definicje" },
          { href: "#s2", num: "§2", label: "Informacje o Administratorze" },
          { href: "#s3", num: "§3", label: "Jakie dane przetwarzamy?" },
          { href: "#s4", num: "§4", label: "Źródła danych" },
          { href: "#s5", num: "§5", label: "Cel, podstawa prawna i okres przetwarzania" },
          { href: "#s6", num: "§6", label: "Odbiorcy i podmioty przetwarzające dane" },
          { href: "#s7", num: "§7", label: "Prawa przysługujące Panu/Pani (art. 15–22 RODO)" },
          { href: "#s8", num: "§8", label: "Dodatkowe informacje techniczne" },
        ]}
      />

      <LegalSection id="s1" num="§1" title="Definicje">
        <ul>
          <li>
            <strong>Administrator:</strong> {sellerName}, działający pod marką Templify – podmiot decydujący o celach i sposobach
            przetwarzania danych osobowych Użytkowników Serwisu. Kontakt:{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
          </li>
          <li>
            <strong>Dane osobowe:</strong> wszelkie informacje o zidentyfikowanej lub możliwej do
            zidentyfikowania osobie fizycznej w rozumieniu art. 4 pkt 1 RODO.
          </li>
          <li>
            <strong>RODO:</strong> Rozporządzenie Parlamentu Europejskiego i Rady (UE) 2016/679 z
            dnia 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem
            danych osobowych i w sprawie swobodnego przepływu takich danych.
          </li>
          <li>
            <strong>Serwis:</strong> platforma internetowa dostępna pod adresem www.templify.pl,
            prowadzona przez Administratora.
          </li>
          <li>
            <strong>Użytkownik:</strong> każda osoba fizyczna korzystająca z Serwisu, w tym
            Konsument.
          </li>
          <li>
            <strong>Podmiot przetwarzający:</strong> podmiot, który przetwarza dane osobowe w
            imieniu Administratora na podstawie zawartej umowy powierzenia przetwarzania danych
            (art. 28 RODO).
          </li>
          <li>
            <strong>Cookies:</strong> pliki tekstowe lub podobne technologie przechowywane w
            urządzeniu końcowym Użytkownika. Szczegóły w{" "}
            <Link href="/polityka-cookies">Polityce Cookies</Link>.
          </li>
          <li>
            <strong>localStorage / sessionStorage:</strong> mechanizm tymczasowego przechowywania
            wybranych ustawień interfejsu w przeglądarce Użytkownika, wyłącznie po stronie klienta.
            Nie służy do przechowywania treści Planerów Interaktywnych, które są zapisywane na
            serwerach Administratora.
          </li>
          <li>
            <strong>Planer Interaktywny:</strong> usługa cyfrowa dostępna w Serwisie po zalogowaniu
            do Konta, w ramach której dane wprowadzone przez Użytkownika (notatki, cele, zadania)
            zapisywane są na serwerach Administratora oraz – w wybranych funkcjach – przetwarzane z
            wykorzystaniem zewnętrznych modeli sztucznej inteligencji (OpenRouter).
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="s2" num="§2" title="Informacje o Administratorze">
        <p>Administratorem danych osobowych Użytkowników Serwisu templify.pl jest:</p>
        <div className="rounded-2xl border border-border/70 bg-secondary/30 p-5">
          <p className="text-base font-semibold text-foreground">{sellerName}</p>
          <p className="mt-1.5">
            {identity.businessAddress ? (
              <>
                Adres: {identity.businessAddress}
                <br />
              </>
            ) : null}
            E-mail: <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
            {identity.businessPhone ? (
              <>
                <br />
                Telefon: <a href={`tel:${identity.businessPhone}`}>{identity.businessPhone}</a>
              </>
            ) : null}
            <br />
            Strona: <Link href="/">www.templify.pl</Link>
          </p>
        </div>
        <p>
          Serwis templify.pl prowadzony jest przez Administratora. Stroną wszelkich Umów zawieranych
          z Użytkownikami jest Administrator.
        </p>
        <p>
          We wszystkich sprawach związanych z przetwarzaniem danych osobowych można kontaktować się
          z Administratorem:
        </p>
        <ul>
          <li>
            drogą e-mail: <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>,
          </li>
          <li>
            przez formularz kontaktowy dostępny na stronie <Link href="/pomoc">Pomoc</Link> (temat:
            „Dane osobowe (RODO)”).
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="s3" num="§3" title="Jakie dane przetwarzamy?">
        <p>
          W zależności od sposobu korzystania z Serwisu, Administrator przetwarza następujące
          kategorie danych osobowych:
        </p>

        <h3>A. Dane podawane przez Użytkownika</h3>
        <ul>
          <li>
            <strong>Dane rejestracyjne:</strong> adres e-mail, hasło (przechowywane w formie
            zaszyfrowanej – hash); zbierane przy rejestracji Konta.
          </li>
          <li>
            <strong>Dane zakupowe:</strong> adres e-mail, identyfikator zamówienia, informacje o
            zakupionych Produktach i płatności; zbierane przy składaniu i realizacji zamówień.
          </li>
          <li>
            <strong>Dane płatnicze:</strong> typ karty płatniczej, ostatnie 4 cyfry numeru karty,
            data ważności, token płatniczy – przetwarzane przez HotPay. Administrator nie
            przechowuje pełnych danych kart; zbierane przy dokonywaniu płatności.
          </li>
          <li>
            <strong>Korespondencja:</strong> treść wiadomości e-mail, zgłoszeń w formularzach
            kontaktowych i reklamacji (wraz z nadanym numerem zgłoszenia i historią jego obsługi);
            zbierana przy kontakcie z obsługą.
          </li>
        </ul>

        <h3>B. Dane zbierane automatycznie</h3>
        <ul>
          <li>
            <strong>Dane techniczne:</strong> adres IP (anonimizowany), typ i wersja przeglądarki,
            system operacyjny, rozdzielczość ekranu, język przeglądarki; cel: bezpieczeństwo i
            diagnostyka techniczna.
          </li>
          <li>
            <strong>Dane behawioralne (anonimowe):</strong> odwiedzane strony, czas sesji, źródło
            wejścia, kliknięcia – zbierane wyłącznie przez narzędzia analityczne niewykorzystujące
            plików cookies i nieidentyfikujące Użytkownika: Plausible Analytics oraz Vercel Web
            Analytics (szczegóły w §8); cel: analiza ruchu i poprawa użyteczności Serwisu.
          </li>
          <li>
            <strong>Logi systemowe:</strong> znacznik czasu żądań HTTP, kody odpowiedzi serwera,
            błędy aplikacji; cel: bezpieczeństwo i diagnostyka.
          </li>
        </ul>

        <h3>C. Dane w Planerach Interaktywnych</h3>
        <p>
          Treści wprowadzane przez Użytkownika do Planerów Interaktywnych (np. notatki, cele,
          zadania) są zapisywane na serwerach Administratora i powiązane z Kontem Użytkownika,
          dzięki czemu pozostają dostępne po zalogowaniu z różnych urządzeń i przeglądarek. Dane
          przesyłane do modeli AI (OpenRouter) za pośrednictwem funkcji generowania treści przez AI
          podlegają zasadom opisanym w §6.
        </p>

        <LegalCallout>
          <p>
            <strong>Administrator nie przetwarza szczególnych kategorii danych osobowych</strong>{" "}
            (tzw. danych wrażliwych w rozumieniu art. 9 RODO, takich jak dane o zdrowiu, poglądach
            politycznych, przynależności rasowej itp.).
          </p>
        </LegalCallout>
      </LegalSection>

      <LegalSection id="s4" num="§4" title="Źródła danych">
        <p>Dane osobowe Użytkowników Administrator pozyskuje z następujących źródeł:</p>
        <ul>
          <li>
            <strong>Bezpośrednio od Użytkownika:</strong> w procesie rejestracji Konta, składania
            zamówień, wypełniania formularzy kontaktowych, korespondencji e-mail oraz korzystania z
            funkcji Serwisu.
          </li>
          <li>
            <strong>Automatycznie w trakcie korzystania z Serwisu:</strong> dane techniczne zbierane
            przez infrastrukturę serwerową (Supabase, Vercel) i zanonimizowane dane statystyczne
            (Plausible Analytics, Vercel Web Analytics).
          </li>
          <li>
            <strong>Od podmiotów przetwarzających:</strong> potwierdzenia transakcji i dane związane
            z płatnościami od HotPay.
          </li>
        </ul>
        <p>
          Administrator nie pozyskuje danych osobowych Użytkowników ze źródeł publicznych ani od
          podmiotów trzecich w celach marketingowych.
        </p>
      </LegalSection>

      <LegalSection id="s5" num="§5" title="Cel, podstawa prawna i okres przetwarzania danych">
        <p>
          Administrator przetwarza dane osobowe Użytkowników w następujących celach, na następujących
          podstawach prawnych i przez następujące okresy:
        </p>
        <ul>
          <li>
            <strong>Zawarcie i wykonanie Umowy</strong> (prowadzenie Konta, realizacja zamówień,
            dostawa Produktów, obsługa reklamacji). Podstawa prawna: art. 6 ust. 1 lit. b RODO
            (niezbędność do wykonania umowy). Okres przechowywania: przez czas trwania Umowy oraz 3
            lata po jej zakończeniu, na wypadek ewentualnych roszczeń.
          </li>
          <li>
            <strong>Wypełnienie obowiązków prawnych</strong> (prowadzenie uproszczonej ewidencji
            sprzedaży, rozliczenia podatkowe i archiwizacja dokumentów sprzedaży). Podstawa prawna:
            art. 6 ust. 1 lit. c RODO (obowiązek prawny wynikający z przepisów podatkowych). Okres
            przechowywania: przez okres wymagany obowiązującymi przepisami.
          </li>
          <li>
            <strong>Prawnie uzasadnione interesy Administratora</strong> (dochodzenie i obrona
            roszczeń, zapobieganie nadużyciom, bezpieczeństwo Serwisu, zanonimizowana analiza
            statystyczna, poprawa funkcjonalności). Podstawa prawna: art. 6 ust. 1 lit. f RODO
            (uzasadniony interes administratora). Okres przechowywania: do czasu wniesienia
            skutecznego sprzeciwu lub do ustania uzasadnionego interesu, maksymalnie 3 lata od
            zakończenia Umowy.
          </li>
          <li>
            <strong>Marketing bezpośredni</strong> (newsletter, powiadomienia o nowościach i
            promocjach), wyłącznie za zgodą. Podstawa prawna: art. 6 ust. 1 lit. a RODO (zgoda
            osoby, której dane dotyczą). Okres przechowywania: do cofnięcia zgody lub do zakończenia
            prowadzenia działalności marketingowej.
          </li>
          <li>
            <strong>Obsługa żądań dotyczących praw podmiotów danych</strong> (rozpatrywanie wniosków
            o dostęp, usunięcie, sprostowanie danych). Podstawa prawna: art. 6 ust. 1 lit. c oraz
            lit. f RODO. Okres przechowywania: do 3 lat od rozpatrzenia żądania, jako dowód
            wypełnienia obowiązku.
          </li>
          <li>
            <strong>Zapewnienie bezpieczeństwa Serwisu i wykrywanie nadużyć.</strong> Podstawa
            prawna: art. 6 ust. 1 lit. f RODO (uzasadniony interes administratora). Okres
            przechowywania: maksymalnie 12 miesięcy od zdarzenia (logi), a w przypadku wszczęcia
            postępowania – dłużej.
          </li>
        </ul>
        <LegalCallout>
          <p>
            <strong>Cofnięcie zgody:</strong> w zakresie, w jakim dane przetwarzane są na podstawie
            zgody (art. 6 ust. 1 lit. a RODO), zgodę można cofnąć w dowolnym momencie bez podawania
            przyczyny, bez wpływu na zgodność z prawem przetwarzania, które miało miejsce przed
            cofnięciem. Zgodę można cofnąć przez ustawienia Konta, link rezygnacji w e-mailu lub
            kontaktując się z Administratorem.
          </p>
        </LegalCallout>
      </LegalSection>

      <LegalSection id="s6" num="§6" title="Odbiorcy i podmioty przetwarzające dane">
        <p>
          Administrator powierza przetwarzanie danych osobowych zaufanym podmiotom na podstawie umów
          powierzenia przetwarzania danych zawartych zgodnie z art. 28 RODO. Poniżej lista podmiotów
          przetwarzających i zakresu ich roli:
        </p>
        <ul>
          <li>
            <strong>Supabase, Inc.</strong> (baza danych, uwierzytelnianie): przechowywanie danych
            Kont Użytkowników (e-mail, hash hasła, historia zakupów, dane Planerów Interaktywnych),
            uwierzytelnianie. Dane hostowane w regionie eu-north-1 (Sztokholm, UE).
          </li>
          <li>
            <strong>HotPay</strong> (płatności): przetwarzanie płatności kartą, BLIK i innymi
            dostępnymi metodami.
          </li>
          <li>
            <strong>Resend, Inc.</strong> (e-mail transakcyjny): wysyłka e-maili transakcyjnych –
            potwierdzenia zamówień, resetowanie hasła, e-maile weryfikacyjne, powiadomienia o
            statusie zgłoszeń.
          </li>
          <li>
            <strong>Vercel, Inc.</strong> (hosting, CDN, anonimowa analityka Web Analytics):
            hostowanie aplikacji frontendowej Serwisu i dostarczanie treści przez sieć CDN,
            przetwarzanie adresów IP w trakcie obsługi żądań HTTP oraz zbieranie zanonimizowanych,
            zagregowanych statystyk odwiedzin (bez plików cookies).
          </li>
          <li>
            <strong>OpenRouter, Inc.</strong> (modele językowe AI): przetwarzanie danych
            wprowadzonych przez Użytkownika do funkcji AI Planerów Interaktywnych (zapytania do
            modeli językowych); dane nie są wykorzystywane do trenowania modeli, zgodnie z
            regulaminem OpenRouter.
          </li>
          <li>
            <strong>Plausible Analytics OÜ</strong> (analityka bez danych osobowych): anonimowa
            analityka ruchu w Serwisie, bez plików cookies i bez możliwości identyfikacji
            indywidualnych Użytkowników. Dane zagregowane przechowywane w Estonii (UE).
          </li>
        </ul>

        <h3>Transfer danych poza Europejski Obszar Gospodarczy (EOG)</h3>
        <p>
          Część Podmiotów przetwarzających może mieć siedzibę poza EOG. W takim przypadku
          Administrator zapewnia odpowiednie zabezpieczenia transferu danych, w szczególności
          poprzez:
        </p>
        <ul>
          <li>
            standardowe klauzule umowne (SCC) przyjęte przez Komisję Europejską na mocy decyzji
            wykonawczej z dnia 4 czerwca 2021 r.,
          </li>
          <li>
            w przypadku podmiotów uczestniczących w programie EU-US Data Privacy Framework –
            certyfikację w ramach tego programu,
          </li>
          <li>
            indywidualną ocenę ryzyka transferu (Transfer Impact Assessment) przeprowadzoną przez
            Administratora.
          </li>
        </ul>
        <p>
          Kopię stosowanych zabezpieczeń transferu można uzyskać, kontaktując się z Administratorem
          pod adresem <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
        </p>

        <h3>Inne kategorie odbiorców</h3>
        <p>
          Administrator może przekazywać dane osobowe Użytkowników innym odbiorcom wyłącznie w
          uzasadnionych przypadkach:
        </p>
        <ul>
          <li>
            <strong>Organy publiczne:</strong> na podstawie bezwzględnie obowiązujących przepisów
            prawa, np. organy podatkowe, organy ścigania, sądy.
          </li>
          <li>
            <strong>Doradcy prawni i audytorzy:</strong> na podstawie umów powierzenia przetwarzania,
            w zakresie niezbędnym do świadczenia usług na rzecz Administratora.
          </li>
        </ul>
        <p>
          Administrator nie sprzedaje danych osobowych Użytkowników ani nie udostępnia ich podmiotom
          trzecim w celach marketingowych bez zgody Użytkownika.
        </p>
      </LegalSection>

      <LegalSection id="s7" num="§7" title="Prawa przysługujące Panu/Pani (art. 15–22 RODO)">
        <p>
          W zakresie przetwarzania danych osobowych Pana/Pani przez Administratora, przysługują
          Panu/Pani następujące prawa:
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            {
              art: "Art. 15 RODO",
              title: "Prawo dostępu",
              body: "Prawo do uzyskania potwierdzenia, czy Administrator przetwarza dane Pana/Pani, a jeżeli tak – prawo dostępu do tych danych oraz do uzyskania ich kopii.",
            },
            {
              art: "Art. 16 RODO",
              title: "Prawo do sprostowania",
              body: "Prawo do żądania poprawienia nieprawidłowych danych lub uzupełnienia niekompletnych danych.",
            },
            {
              art: "Art. 17 RODO",
              title: "Prawo do usunięcia",
              body: "Prawo do żądania usunięcia danych („prawo do bycia zapomnianym”), jeżeli zachodzi jedna z przesłanek art. 17 RODO, m.in. cofnięcie zgody lub brak podstawy prawnej.",
            },
            {
              art: "Art. 18 RODO",
              title: "Prawo do ograniczenia",
              body: "Prawo do żądania ograniczenia przetwarzania danych w przypadkach wskazanych w art. 18 RODO, np. kwestionowanie prawidłowości danych.",
            },
            {
              art: "Art. 20 RODO",
              title: "Prawo do przenoszenia",
              body: "Prawo do otrzymania swoich danych w ustrukturyzowanym, powszechnie używanym formacie nadającym się do odczytu maszynowego, w zakresie danych przetwarzanych na podstawie zgody lub umowy.",
            },
            {
              art: "Art. 21 RODO",
              title: "Prawo do sprzeciwu",
              body: "Prawo do wniesienia sprzeciwu wobec przetwarzania danych na podstawie uzasadnionego interesu Administratora (art. 6 ust. 1 lit. f), w tym wobec marketingu bezpośredniego.",
            },
            {
              art: "Art. 7 ust. 3 RODO",
              title: "Cofnięcie zgody",
              body: "Prawo do cofnięcia zgody w dowolnym momencie, bez wpływu na zgodność z prawem przetwarzania, które nastąpiło przed jej cofnięciem.",
            },
            {
              art: "Art. 77 RODO",
              title: "Prawo do skargi",
              body: "Prawo do wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych (ul. Stawki 2, 00-193 Warszawa, uodo.gov.pl), jeżeli Pan/Pani uważa, że przetwarzanie narusza RODO.",
            },
          ].map((right) => (
            <div key={right.art} className="rounded-2xl border border-border/70 bg-background/60 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-primary">{right.art}</p>
              <p className="mt-1 text-sm font-semibold text-foreground">{right.title}</p>
              <p className="mt-1.5 text-xs leading-6 text-muted-foreground">{right.body}</p>
            </div>
          ))}
        </div>

        <h3>Jak skorzystać z przysługujących praw?</h3>
        <p>W celu skorzystania z przysługujących praw prosimy o kontakt z Administratorem:</p>
        <ul>
          <li>
            e-mailem: <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>,
          </li>
          <li>
            przez formularz na stronie <Link href="/pomoc">Pomoc</Link> (temat: „Dane osobowe
            (RODO)”).
          </li>
        </ul>
        <p>
          Administrator rozpatruje żądania bez zbędnej zwłoki, w terminie nie dłuższym niż{" "}
          <strong>30 dni</strong> od dnia otrzymania żądania. W przypadku złożonych lub licznych
          żądań termin może zostać przedłużony o kolejne 60 dni, o czym Użytkownik zostanie
          poinformowany.
        </p>
        <LegalCallout>
          <p>
            <strong>Weryfikacja tożsamości:</strong> w celu ochrony danych osobowych przed
            nieuprawnionym dostępem Administrator może zażądać od Pana/Pani dodatkowych informacji
            potwierdzających tożsamość przed rozpatrzeniem żądania.
          </p>
        </LegalCallout>
      </LegalSection>

      <LegalSection id="s8" num="§8" title="Dodatkowe informacje techniczne">
        <h3>Analityka bez plików cookies (Plausible, Vercel Web Analytics)</h3>
        <p>
          Serwis korzysta z usługi <strong>Plausible Analytics</strong> świadczonej przez Plausible
          Insights OÜ (Estonia, EOG) oraz z <strong>Vercel Web Analytics</strong> świadczonej przez
          Vercel Inc. do pomiaru ruchu i analizy sposobu korzystania z Serwisu.
        </p>
        <LegalCallout>
          <p>
            <strong>Narzędzia te nie używają plików cookies i nie przetwarzają danych osobowych.</strong>{" "}
            Statystyki są gromadzone w formie w pełni anonimowej i zagregowanej. Adres IP Użytkownika
            jest anonimizowany przed jakimkolwiek przetwarzaniem, a danych tych nie można powiązać z
            konkretnym Użytkownikiem. Szczegóły:{" "}
            <a
              href="https://plausible.io/privacy-focused-web-analytics"
              target="_blank"
              rel="noopener noreferrer"
            >
              plausible.io
            </a>
            {" · "}
            <a
              href="https://vercel.com/docs/analytics/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
            >
              vercel.com
            </a>
          </p>
        </LegalCallout>
        <p>
          Zbierane anonimowe dane obejmują: kraj Użytkownika, typ urządzenia, przeglądarkę, system
          operacyjny, odwiedzone strony, czas sesji i źródło wejścia. Żadne z tych danych nie są
          danymi osobowymi w rozumieniu RODO.
        </p>

        <h3>Przechowywanie danych Planerów Interaktywnych</h3>
        <p>
          Planery Interaktywne oferowane w Serwisie zapisują dane wprowadzone przez Użytkownika
          (notatki, ustawienia, postęp) na serwerach Administratora, w powiązaniu z Kontem
          Użytkownika. Dzięki temu dane są dostępne po zalogowaniu z różnych urządzeń i przeglądarek.
          Wybrane, tymczasowe ustawienia interfejsu mogą być dodatkowo przechowywane lokalnie w
          przeglądarce Użytkownika (<code>localStorage</code> lub <code>sessionStorage</code>),
          jednak nie stanowi to głównego miejsca przechowywania treści Planerów.
        </p>

        <h3>Pliki cookies</h3>
        <p>
          Szczegółowe informacje dotyczące plików cookies i podobnych technologii, w tym niezbędnych
          sesyjnych, funkcjonalnych i analitycznych, zawiera odrębny dokument –{" "}
          <Link href="/polityka-cookies">
            <strong>Polityka Cookies</strong>
          </Link>{" "}
          dostępna na stronie Serwisu. Serwis stosuje wyłącznie cookies niezbędne do jego
          funkcjonowania, sesyjne, związane z uwierzytelnianiem i bezpieczeństwem. Nie stosujemy
          cookies reklamowych ani profilujących.
        </p>

        <h3>Profilowanie</h3>
        <p>
          Administrator nie dokonuje profilowania Użytkowników w rozumieniu art. 4 pkt 4 RODO, które
          wywoływałoby wobec nich skutki prawne lub w podobny sposób istotnie na nich wpływało.
          Analityka statystyczna (Plausible, Vercel Web Analytics) ma charakter całkowicie anonimowy
          i zagregowany.
        </p>

        <h3>Zmiany Polityki Prywatności</h3>
        <p>
          Administrator zastrzega sobie prawo do zmiany niniejszej Polityki Prywatności z ważnych
          przyczyn, w szczególności w przypadku zmian przepisów prawa, wdrożenia nowych usług lub
          zmian w sposobie przetwarzania danych. O istotnych zmianach Administrator poinformuje
          Użytkowników posiadających Konto drogą e-mail z wyprzedzeniem co najmniej{" "}
          <strong>14 dni</strong>. Aktualna wersja Polityki Prywatności dostępna jest zawsze pod
          adresem <Link href="/polityka-prywatnosci">www.templify.pl/polityka-prywatnosci</Link>.
        </p>
        <p>
          Niniejsza Polityka Prywatności wchodzi w życie z dniem <strong>8 lipca 2026 r.</strong>
        </p>
      </LegalSection>
    </LegalShell>
  );
}
