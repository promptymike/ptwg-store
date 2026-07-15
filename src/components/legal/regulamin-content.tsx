import Link from "next/link";

import {
  LegalAttachment,
  LegalCallout,
  LegalFormField,
  LegalSection,
  LegalShell,
  LegalToc,
} from "@/components/legal/legal-document";
import {
  legalSellerContactLine,
  legalSellerName,
  type LegalIdentity,
} from "@/components/legal/legal-identity";

// Final, legally binding regulamin (source: legal review, effective
// 2026-07-08). Content changes here should go through the same review the
// original document did — this page is what the payment operator audits.
export function RegulaminContent({ identity }: { identity: LegalIdentity }) {
  const SUPPORT_EMAIL = identity.supportEmail;
  const sellerName = legalSellerName(identity);

  return (
    <LegalShell
      eyebrow="Dokumenty prawne"
      title="Regulamin Serwisu templify.pl"
      lead="Zasady i warunki korzystania z serwisu templify.pl, w tym zawierania i wykonywania umów o dostarczanie treści cyfrowych oraz świadczenie usług drogą elektroniczną."
      effectiveDate="8 lipca 2026 r."
    >
      <LegalToc
        items={[
          { href: "#s1", num: "§1", label: "Postanowienia ogólne" },
          { href: "#s2", num: "§2", label: "Zawarcie umowy o świadczeniu Usług" },
          { href: "#s3", num: "§3", label: "Konto Użytkownika" },
          { href: "#s4", num: "§4", label: "Uprawnienia i odpowiedzialność Usługodawcy" },
          { href: "#s5", num: "§5", label: "Zamówienie i płatność" },
          { href: "#s6", num: "§6", label: "Ochrona własności intelektualnej i licencja" },
          { href: "#s7", num: "§7", label: "Reklamacje i zgodność treści cyfrowej" },
          { href: "#s71", num: "§7¹", label: "Zgłaszanie nielegalnych treści (DSA)" },
          { href: "#s8", num: "§8", label: "Wypowiedzenie Umowy" },
          { href: "#s9", num: "§9", label: "Odstąpienie od Umowy" },
          { href: "#s10", num: "§10", label: "Dane osobowe" },
          { href: "#s11", num: "§11", label: "Postanowienia końcowe" },
          { href: "#zal1", num: "Zał. 1", label: "Wzór oświadczenia o odstąpieniu" },
          { href: "#zal2", num: "Zał. 2", label: "Metody płatności" },
        ]}
      />

      <LegalSection id="s1" num="§1" title="Postanowienia ogólne">
        <p>
          Niniejszy regulamin (dalej: <strong>„Regulamin”</strong>) określa zasady i warunki
          korzystania z serwisu internetowego dostępnego pod adresem <strong>www.templify.pl</strong>{" "}
          (dalej: <strong>„Serwis”</strong>), w tym zasady zawierania i wykonywania umów o
          dostarczanie treści cyfrowych oraz świadczenie usług drogą elektroniczną.
        </p>
        <p>Regulamin został sporządzony na podstawie przepisów prawa polskiego, w tym w szczególności:</p>
        <ul>
          <li>Ustawy z dnia 30 maja 2014 r. o prawach konsumenta (dalej: <strong>„UPK”</strong>),</li>
          <li>Ustawy z dnia 18 lipca 2002 r. o świadczeniu usług drogą elektroniczną (dalej: <strong>„UŚUDE”</strong>),</li>
          <li>Ustawy z dnia 23 kwietnia 1964 r. Kodeks cywilny,</li>
          <li>
            Rozporządzenia Parlamentu Europejskiego i Rady (UE) 2022/2065 z dnia 19 października
            2022 r. o jednolitym rynku usług cyfrowych (dalej: <strong>„DSA”</strong>),
          </li>
          <li>Dyrektywy 2019/770/UE o treściach cyfrowych i usługach cyfrowych,</li>
          <li>Rozporządzenia Parlamentu Europejskiego i Rady (UE) 2016/679 (RODO).</li>
        </ul>

        <h3>Definicje</h3>
        <ul>
          <li>
            <strong>Usługodawca / Templify:</strong> {sellerName}, podmiot zarządzający Serwisem i
            zawierający Umowy z Użytkownikami. Kontakt:{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
          </li>
          <li>
            <strong>Serwis:</strong> platforma internetowa dostępna pod adresem www.templify.pl, za
            pośrednictwem której Usługodawca oferuje treści cyfrowe oraz usługi cyfrowe.
          </li>
          <li>
            <strong>Użytkownik:</strong> każda osoba fizyczna posiadająca zdolność do czynności
            prawnych, korzystająca z Serwisu, w tym Konsument.
          </li>
          <li>
            <strong>Konsument:</strong> Użytkownik będący osobą fizyczną dokonującą czynności
            prawnej niezwiązanej bezpośrednio z jej działalnością gospodarczą lub zawodową.
          </li>
          <li>
            <strong>Konto:</strong> indywidualny panel dostępny po rejestracji, umożliwiający dostęp
            do zakupionych Produktów oraz zarządzanie Umowami.
          </li>
          <li>
            <strong>E-book:</strong> treść cyfrowa w postaci publikacji elektronicznej (format PDF
            i/lub EPUB) dostępna do pobrania po dokonaniu zakupu.
          </li>
          <li>
            <strong>Planer Interaktywny:</strong> usługa cyfrowa w postaci interaktywnego narzędzia
            dostępnego w Serwisie po zalogowaniu do Konta, którego dane zapisywane są na serwerach
            Usługodawcy oraz w wybranych funkcjach przetwarzane z wykorzystaniem technologii
            sztucznej inteligencji.
          </li>
          <li>
            <strong>Produkt:</strong> E-book lub Planer Interaktywny dostępny w ofercie Serwisu.
          </li>
          <li>
            <strong>Umowa:</strong> umowa o dostarczanie treści cyfrowej lub świadczenie usługi
            cyfrowej zawierana między Usługodawcą a Użytkownikiem za pośrednictwem Serwisu.
          </li>
          <li>
            <strong>Regulamin:</strong> niniejszy dokument wraz z załącznikami.
          </li>
        </ul>

        <p>
          Operatorem Serwisu i stroną Umów zawieranych z Użytkownikami jest Usługodawca –{" "}
          <strong>{sellerName}</strong>, działający pod marką <strong>Templify</strong>.
        </p>
        <LegalCallout>
          <p>
            <strong>Dane Usługodawcy:</strong>
            <br />
            {sellerName}
            {identity.businessAddress ? (
              <>
                <br />{identity.businessAddress}
              </>
            ) : null}
            <br />
            E-mail obsługi klienta i reklamacji:{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
            {identity.businessPhone ? (
              <>
                <br />
                Telefon: <a href={`tel:${identity.businessPhone}`}>{identity.businessPhone}</a>
              </>
            ) : null}
          </p>
        </LegalCallout>
        <p>Kontakt z Usługodawcą możliwy jest:</p>
        <ul>
          <li>
            drogą e-mail: <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>,
          </li>
          {identity.businessPhone ? (
            <li>
              telefonicznie: <a href={`tel:${identity.businessPhone}`}>{identity.businessPhone}</a>,
            </li>
          ) : null}
          <li>
            przez formularz kontaktowy dostępny w Serwisie w sekcji{" "}
            <Link href="/pomoc">Pomoc</Link>.
          </li>
        </ul>
        <p>
          Serwis skierowany jest do osób pełnoletnich. Osoby, które nie ukończyły 18. roku życia,
          mogą korzystać z Serwisu wyłącznie za zgodą przedstawiciela ustawowego.
        </p>
      </LegalSection>

      <LegalSection id="s2" num="§2" title="Zawarcie umowy o świadczeniu Usług">
        <p>
          Do korzystania z Serwisu niezbędne jest urządzenie z dostępem do internetu oraz aktualna
          wersja przeglądarki internetowej obsługującej JavaScript (np. Google Chrome, Firefox,
          Safari, Edge). Serwis jest dostępny wyłącznie przez przeglądarkę internetową – Usługodawca
          nie oferuje dedykowanej aplikacji mobilnej.
        </p>

        <h3>Rejestracja Konta</h3>
        <p>
          Korzystanie z pełnej funkcjonalności Serwisu, w tym dostęp do zakupionych Produktów,
          wymaga założenia Konta. Rejestracja jest bezpłatna i dobrowolna. W celu rejestracji
          Użytkownik:
        </p>
        <ol>
          <li>wypełnia formularz rejestracyjny podając adres e-mail oraz ustawiając hasło,</li>
          <li>zapoznaje się z Regulaminem i Polityką Prywatności oraz akceptuje ich treść,</li>
          <li>zatwierdza rejestrację kliknięciem przycisku „Utwórz konto”.</li>
        </ol>
        <p>
          Umowa o świadczenie usługi prowadzenia Konta (bezpłatna, na czas nieokreślony) zostaje
          zawarta z chwilą zakończenia rejestracji potwierdzonej wysłaniem e-maila weryfikacyjnego
          przez Usługodawcę.
        </p>

        <h3>Zakup jako gość</h3>
        <p>
          Usługodawca może umożliwić dokonanie zakupu bez rejestracji Konta (
          <strong>„tryb gościa”</strong>). W takim przypadku dostęp do zakupionego Produktu
          zapewniany jest za pomocą indywidualnego linku wysłanego na podany adres e-mail.
          Usługodawca nie gwarantuje długoterminowego przechowywania historii zamówień w trybie
          gościa.
        </p>

        <h3>Wymagania techniczne</h3>
        <LegalCallout>
          <p>
            <strong>Minimalne wymagania techniczne:</strong> aktualna przeglądarka internetowa
            (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+), dostęp do internetu, obsługa
            JavaScript. Do korzystania z Planerów Interaktywnych zalecana rozdzielczość ekranu min.
            1024×768 px.
          </p>
        </LegalCallout>
        <p>
          Użytkownik zobowiązany jest korzystać z Serwisu zgodnie z Regulaminem, obowiązującymi
          przepisami prawa i dobrymi obyczajami. Zakazane jest dostarczanie treści o charakterze
          bezprawnym.
        </p>
      </LegalSection>

      <LegalSection id="s3" num="§3" title="Konto Użytkownika">
        <p>Konto Użytkownika umożliwia:</p>
        <ul>
          <li>dostęp do wszystkich zakupionych Produktów (historia zakupów i biblioteka),</li>
          <li>pobieranie zakupionych E-booków w dostępnych formatach,</li>
          <li>korzystanie z zakupionych Planerów Interaktywnych bezpośrednio w Serwisie,</li>
          <li>zarządzanie danymi osobowymi i ustawieniami powiadomień,</li>
          <li>przeglądanie historii płatności i dokumentów sprzedaży,</li>
          <li>
            kontakt z obsługą klienta i podgląd statusu zgłoszeń w sekcji{" "}
            <Link href="/konto/zgloszenia">Konto → Zgłoszenia</Link>.
          </li>
        </ul>

        <h3>Bezpieczeństwo Konta</h3>
        <p>
          Użytkownik jest zobowiązany do zachowania poufności danych logowania (e-mail, hasło) i
          nieudostępniania ich osobom trzecim. W przypadku podejrzenia nieuprawnionego dostępu do
          Konta Użytkownik zobowiązany jest niezwłocznie powiadomić Usługodawcę pod adresem{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> oraz zmienić hasło.
        </p>
        <p>
          Jedno Konto może być używane wyłącznie przez jedną osobę. Zakazane jest udostępnianie
          Konta osobom trzecim.
        </p>

        <h3>Zawieszenie Konta</h3>
        <p>
          Usługodawca może tymczasowo zawiesić Konto w przypadku uzasadnionego podejrzenia
          naruszenia Regulaminu, na czas wyjaśnienia sprawy, uprzednio informując Użytkownika
          e-mailem. Usługodawca podejmie decyzję o dalszym postępowaniu w rozsądnym terminie, nie
          dłuższym niż 14 dni.
        </p>
      </LegalSection>

      <LegalSection id="s4" num="§4" title="Uprawnienia i odpowiedzialność Usługodawcy">
        <h3>Uprawnienia Usługodawcy</h3>
        <p>Usługodawca uprawniony jest do:</p>
        <ul>
          <li>
            zablokowania lub usunięcia Konta Użytkownika, który narusza postanowienia Regulaminu lub
            przepisy prawa, po uprzednim poinformowaniu Użytkownika e-mailem z podaniem przyczyny,
          </li>
          <li>
            czasowego ograniczenia dostępu do Serwisu lub jego poszczególnych funkcji w celach
            technicznych, konserwacyjnych lub aktualizacyjnych,
          </li>
          <li>
            modyfikacji oferty Produktów, w tym dodawania i wycofywania Produktów z oferty, z
            zastrzeżeniem praw Użytkowników do zakupionych Produktów,
          </li>
          <li>
            wysyłania komunikatów technicznych i informacyjnych związanych z funkcjonowaniem
            Serwisu.
          </li>
        </ul>

        <h3>Przerwy techniczne</h3>
        <p>
          Usługodawca dołoży starań, aby Serwis był dostępny 24/7, jednak nie gwarantuje
          nieprzerwanej dostępności. O planowanych przerwach konserwacyjnych trwających dłużej niż 2
          godziny Usługodawca poinformuje Użytkowników z wyprzedzeniem, w miarę możliwości co
          najmniej 24 godziny wcześniej, za pośrednictwem poczty e-mail lub komunikatu w Serwisie.
        </p>

        <h3>Ograniczenie odpowiedzialności</h3>
        <p>W zakresie dozwolonym przez prawo, Usługodawca nie ponosi odpowiedzialności za:</p>
        <ul>
          <li>
            przerwy w działaniu Serwisu spowodowane okolicznościami niezależnymi od Usługodawcy
            (siła wyższa, awarie infrastruktury zewnętrznej),
          </li>
          <li>
            nieprawidłowe działanie Serwisu wynikające z niespełnienia minimalnych wymagań
            technicznych przez Użytkownika,
          </li>
          <li>
            treści zamieszczone w zakupionych Produktach w zakresie, w jakim Produkty te są dziełem
            zewnętrznych twórców, z wyłączeniem przypadków niezgodności Produktu z Umową.
          </li>
        </ul>

        <LegalCallout>
          <p>
            <strong>Ważne:</strong> Dane wprowadzane przez Użytkownika w Planerach Interaktywnych są
            zapisywane na serwerach Usługodawcy i powiązane z Kontem Użytkownika, dzięki czemu
            pozostają dostępne po zalogowaniu z różnych urządzeń i przeglądarek. Wyczyszczenie
            danych przeglądarki lub zmiana urządzenia nie powoduje utraty tych danych. Dostęp do
            danych Planerów Interaktywnych zostaje utracony wyłącznie w przypadku usunięcia Konta,
            zgodnie z §8 Regulaminu.
          </p>
        </LegalCallout>
        <p>
          Ograniczenie odpowiedzialności nie dotyczy szkód wyrządzonych umyślnie, szkód na osobie
          oraz roszczeń Konsumentów wynikających z bezwzględnie obowiązujących przepisów prawa.
        </p>
      </LegalSection>

      <LegalSection id="s5" num="§5" title="Zamówienie i płatność">
        <h3>Proces zakupu</h3>
        <p>Aby zakupić Produkt, Użytkownik:</p>
        <ol>
          <li>wybiera Produkt z oferty Serwisu i klika „Kup teraz” lub „Dodaj do koszyka”,</li>
          <li>przechodzi do koszyka i weryfikuje zamówienie,</li>
          <li>podaje dane niezbędne do realizacji zamówienia,</li>
          <li>wybiera metodę płatności,</li>
          <li>przed złożeniem zamówienia zapoznaje się z Regulaminem i Polityką Prywatności,</li>
          <li>
            w przypadku zakupu Produktu z natychmiastowym dostarczeniem treści cyfrowej – wyraża
            zgodę na natychmiastowe wykonanie Umowy i przyjmuje do wiadomości utratę prawa
            odstąpienia zgodnie z art. 38 ust. 1 pkt 13 UPK (szczegóły w §9),
          </li>
          <li>klika przycisk „Zamawiam i płacę” – co stanowi złożenie wiążącego zamówienia.</li>
        </ol>

        <h3>Potwierdzenie zamówienia</h3>
        <p>
          Po skutecznym złożeniu zamówienia Użytkownik otrzymuje na wskazany adres e-mail
          potwierdzenie zamówienia zawierające szczegóły transakcji. Umowa zostaje zawarta z chwilą
          przesłania tego potwierdzenia przez Usługodawcę.
        </p>

        <h3>Ceny i dokumenty sprzedaży</h3>
        <p>
          Wszystkie ceny podane w Serwisie są cenami końcowymi dla Użytkownika. Usługodawca
          prowadzi działalność nierejestrowaną i korzysta ze zwolnienia z VAT, dlatego nie dolicza
          podatku VAT ani nie wystawia faktur VAT. Na żądanie Użytkownika Usługodawca przekazuje
          dokument potwierdzający sprzedaż zgodnie z obowiązującymi przepisami.
        </p>

        <h3>Płatności</h3>
        <p>
          Obsługę płatności w Serwisie zapewnia zewnętrzny operator płatności HotPay. Szczegółowe
          informacje na temat dostępnych metod płatności zawarte są w{" "}
          <a href="#zal2">Załączniku nr 2</a> do Regulaminu.
        </p>
        <p>
          Rozliczenia transakcji e-przelewem przeprowadzane są za pośrednictwem <strong>HotPay</strong>.
          Aktualnie dostępne dla danego zamówienia metody płatności są prezentowane Użytkownikowi
          na ekranie płatności przed zatwierdzeniem transakcji.
        </p>
        <LegalCallout>
          <p>
            <strong>Bezpieczeństwo płatności:</strong> dane kart płatniczych są przetwarzane
            wyłącznie przez HotPay i nie są przechowywane przez Usługodawcę. Transakcje szyfrowane
            są z użyciem protokołu TLS.
          </p>
        </LegalCallout>
        <p>
          W przypadku braku płatności lub nieudanej transakcji zamówienie zostaje anulowane, a
          dostęp do Produktu nie zostaje przyznany.
        </p>

        <h3>Dostawa Produktu</h3>
        <p>Po potwierdzeniu płatności:</p>
        <ul>
          <li>
            <strong>E-booki</strong> są dostępne do pobrania natychmiast w Koncie Użytkownika
            (zakładka „Biblioteka”) oraz przesyłane na adres e-mail jako link do pobrania.
          </li>
          <li>
            <strong>Planery Interaktywne</strong> są aktywowane natychmiast i dostępne przez Konto
            Użytkownika w Serwisie.
          </li>
        </ul>
        <p>
          Dostawa wszystkich Produktów odbywa się wyłącznie cyfrowo i jest <strong>bezpłatna</strong>.
          Serwis nie prowadzi wysyłki fizycznej, dlatego do zamówienia nie są doliczane koszty
          przesyłki. Dostęp nie jest ograniczony terytorialnie, z zastrzeżeniem obowiązujących
          przepisów prawa oraz technicznej dostępności internetu.
        </p>
      </LegalSection>

      <LegalSection id="s6" num="§6" title="Ochrona własności intelektualnej i licencja">
        <h3>Własność intelektualna</h3>
        <p>
          Wszelkie prawa własności intelektualnej do Produktów oferowanych w Serwisie (w tym prawa
          autorskie do e-booków, elementów graficznych, oprogramowania Planerów Interaktywnych oraz
          wszelkich treści) należą do Usługodawcy lub podmiotów, które udzieliły Usługodawcy
          odpowiedniej licencji. Żadne postanowienie Regulaminu nie przenosi na Użytkownika praw
          własności intelektualnej do Produktów.
        </p>

        <h3>Licencja na korzystanie z Produktów</h3>
        <p>
          Z chwilą zakupu Produktu Usługodawca udziela Użytkownikowi niewyłącznej, nieprzenoszalnej,
          nieograniczonej terytorialnie licencji na korzystanie z Produktu wyłącznie na użytek
          osobisty i niekomercyjny. Licencja uprawnia do:
        </p>
        <ul>
          <li>
            pobrania i przechowywania E-booka na urządzeniach osobistych Użytkownika (w liczbie
            uzasadnionej użytkiem osobistym),
          </li>
          <li>czytania E-booka na urządzeniach osobistych,</li>
          <li>korzystania z Planera Interaktywnego w Serwisie na własne potrzeby.</li>
        </ul>

        <h3>Zakazy</h3>
        <LegalCallout>
          <p>
            <strong>Zakazane działania:</strong> Użytkownik nie jest uprawniony do: (a) kopiowania,
            zwielokrotniania i dystrybucji Produktów lub ich fragmentów osobom trzecim bez zgody
            Usługodawcy; (b) sprzedaży, odsprzedaży, sublicencjonowania lub udostępniania Produktów
            odpłatnie lub nieodpłatnie osobom trzecim; (c) usuwania lub modyfikowania oznaczeń
            autorskich lub znaków towarowych; (d) dekompilacji, dezasemblacji lub inżynierii
            odwrotnej oprogramowania Planerów Interaktywnych; (e) wykorzystywania Produktów w celach
            komercyjnych bez odrębnej umowy z Usługodawcą.
          </p>
        </LegalCallout>

        <h3>Treści generowane z użyciem AI</h3>
        <p>
          Wybrane Planery Interaktywne korzystają z technologii sztucznej inteligencji (modele
          językowe dostarczane przez OpenRouter Inc.) do generowania sugestii, analiz lub treści
          pomocniczych. Treści wygenerowane przez AI:
        </p>
        <ul>
          <li>są dostarczane „tak jak są” i mają charakter pomocniczy,</li>
          <li>nie zastępują profesjonalnego doradztwa (prawnego, medycznego, finansowego itp.),</li>
          <li>mogą zawierać nieścisłości – Użytkownik korzysta z nich na własną odpowiedzialność,</li>
          <li>
            dane przesyłane do modelu AI przetwarzane są przez OpenRouter Inc. zgodnie z jego
            polityką prywatności (szczegóły w{" "}
            <Link href="/polityka-prywatnosci">Polityce Prywatności</Link>).
          </li>
        </ul>

        <h3>Znaki towarowe</h3>
        <p>
          Nazwa „Templify”, logo Serwisu oraz inne oznaczenia używane w Serwisie są zastrzeżonymi
          znakami towarowymi lub chronionymi oznaczeniami Usługodawcy. Korzystanie z tych oznaczeń
          bez pisemnej zgody Usługodawcy jest zabronione.
        </p>
      </LegalSection>

      <LegalSection id="s7" num="§7" title="Reklamacje i zgodność treści cyfrowej">
        <h3>Zgodność Produktu z Umową</h3>
        <p>
          Usługodawca ponosi odpowiedzialność za brak zgodności Produktu z Umową na zasadach
          określonych w Dyrektywie 2019/770/UE oraz implementujących ją przepisach polskiego prawa.
          Produkt jest zgodny z Umową, jeżeli w szczególności spełnia wymagania co do:
        </p>
        <ul>
          <li>opisu i funkcjonalności wskazanych w Serwisie,</li>
          <li>
            przydatności do celu, dla którego zazwyczaj używa się treści lub usług cyfrowych tego
            samego rodzaju,
          </li>
          <li>kompletności, integralności i ciągłości dostarczania.</li>
        </ul>

        <h3>Gwarancja i odpowiedzialność ustawowa</h3>
        <p>
          Usługodawca nie udziela dodatkowej gwarancji handlowej na Produkty. Brak gwarancji nie
          wyłącza ani nie ogranicza ustawowej odpowiedzialności Usługodawcy za zgodność treści lub
          usługi cyfrowej z Umową ani uprawnień Konsumenta opisanych w niniejszym paragrafie.
        </p>

        <h3>Składanie reklamacji</h3>
        <p>Reklamacje dotyczące Produktów lub funkcjonowania Serwisu można składać:</p>
        <ul>
          <li>
            e-mailem na adres: <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>,
          </li>
          <li>
            przez formularz reklamacyjny dostępny w Serwisie w sekcji{" "}
            <Link href="/pomoc">Pomoc</Link>.
          </li>
        </ul>
        <p>
          Reklamacja powinna zawierać: imię i nazwisko Użytkownika, adres e-mail przypisany do
          Konta, numer zamówienia, opis problemu oraz – w miarę możliwości – zrzuty ekranu lub inne
          dokumenty potwierdzające zgłaszany problem.
        </p>
        <LegalCallout>
          <p>
            <strong>Numer zgłoszenia i status:</strong> każde zgłoszenie złożone przez formularz w
            Serwisie otrzymuje indywidualny numer (np. TPL-00123). Status zgłoszenia można na
            bieżąco śledzić na stronie <Link href="/pomoc">Pomoc</Link> (po podaniu numeru
            zgłoszenia i adresu e-mail) lub w sekcji{" "}
            <Link href="/konto/zgloszenia">Konto → Zgłoszenia</Link>.
          </p>
        </LegalCallout>

        <h3>Rozpatrzenie reklamacji</h3>
        <p>
          Usługodawca rozpatruje reklamację w terminie <strong>14 dni</strong> od dnia jej
          otrzymania i informuje Użytkownika o sposobie rozstrzygnięcia drogą e-mail. W przypadku
          Konsumentów, brak odpowiedzi w ww. terminie oznacza uznanie reklamacji.
        </p>
        <p>W przypadku uznania reklamacji Usługodawca, wedle wyboru lub w porozumieniu z Użytkownikiem:</p>
        <ul>
          <li>dostarcza Produkt ponownie lub dostarczy jego zaktualizowaną wersję,</li>
          <li>naprawia brak zgodności Produktu,</li>
          <li>obniża cenę proporcjonalnie do stwierdzonej niezgodności,</li>
          <li>zwraca pełną kwotę za Produkt (w przypadkach określonych przepisami prawa).</li>
        </ul>
      </LegalSection>

      <LegalSection id="s71" num="§7¹" title="Zgłaszanie nielegalnych treści (DSA)">
        <p>
          Zgodnie z Rozporządzeniem DSA (Rozporządzenie (UE) 2022/2065), Usługodawca udostępnia
          mechanizm umożliwiający zgłaszanie treści lub działań nielegalnych dostępnych w Serwisie.
        </p>

        <h3>Co można zgłosić?</h3>
        <p>
          Zgłoszeniu podlegają w szczególności treści lub działania, które Użytkownik uważa za
          nielegalne, w tym m.in.:
        </p>
        <ul>
          <li>naruszenie praw autorskich lub praw własności intelektualnej,</li>
          <li>treści o charakterze mowy nienawiści lub dyskryminacyjnym,</li>
          <li>naruszenia dóbr osobistych.</li>
        </ul>

        <h3>Jak zgłosić?</h3>
        <p>Zgłoszenia nielegalnych treści można dokonać:</p>
        <ul>
          <li>
            e-mailem na adres: <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>,
          </li>
          <li>
            przez formularz w sekcji <Link href="/pomoc">Pomoc</Link>, wybierając temat „Zgłoszenie
            nielegalnych treści (DSA)”.
          </li>
        </ul>
        <p>
          Zgłoszenie powinno zawierać: opis treści i jej lokalizację w Serwisie (URL lub inna
          identyfikacja), powód uznania treści za nielegalną oraz – opcjonalnie – dane kontaktowe
          zgłaszającego (w celu udzielenia odpowiedzi).
        </p>
        <p>
          Usługodawca rozpatrzy zgłoszenie bez zbędnej zwłoki i poinformuje zgłaszającego o
          podjętych działaniach, o ile zgłaszający podał dane kontaktowe.
        </p>
      </LegalSection>

      <LegalSection id="s8" num="§8" title="Wypowiedzenie Umowy">
        <h3>Wypowiedzenie przez Użytkownika</h3>
        <p>
          Użytkownik może w każdym czasie wypowiedzieć Umowę o prowadzenie Konta (bezpłatną) ze
          skutkiem natychmiastowym poprzez przesłanie żądania usunięcia Konta e-mailem na adres{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> lub przez formularz w sekcji{" "}
          <Link href="/pomoc">Pomoc</Link>.
        </p>
        <p>Usunięcie Konta powoduje:</p>
        <ul>
          <li>
            utratę dostępu do Konta i biblioteki zakupionych Produktów w Serwisie (Planer
            Interaktywny),
          </li>
          <li>
            usunięcie danych Użytkownika zgodnie z Polityką Prywatności i obowiązującymi przepisami
            prawa (z zastrzeżeniem archiwizacji danych wymaganych przez prawo, np. na potrzeby
            rozliczeń podatkowych).
          </li>
        </ul>
        <LegalCallout>
          <p>
            <strong>Uwaga:</strong> Usunięcie Konta nie anuluje wcześniej złożonych zamówień. Dostęp
            do pobranych E-booków pozostaje możliwy przez pobrany plik. Dostęp do danych Planerów
            Interaktywnych zostaje utracony z chwilą usunięcia Konta.
          </p>
        </LegalCallout>

        <h3>Wypowiedzenie przez Usługodawcę</h3>
        <p>
          Usługodawca może wypowiedzieć Umowę o prowadzenie Konta z zachowaniem 14-dniowego okresu
          wypowiedzenia, informując Użytkownika e-mailem, w następujących przypadkach:
        </p>
        <ul>
          <li>rażącego lub powtarzającego się naruszenia Regulaminu,</li>
          <li>działania na szkodę Usługodawcy lub innych Użytkowników,</li>
          <li>
            podania nieprawdziwych danych przy rejestracji lub w trakcie korzystania z Serwisu.
          </li>
        </ul>
        <p>
          W przypadku naruszenia prawa lub rażącego naruszenia Regulaminu Usługodawca może
          zablokować Konto ze skutkiem natychmiastowym. Użytkownik jest informowany e-mailem o
          przyczynach blokady i może złożyć odwołanie w terminie 14 dni.
        </p>
      </LegalSection>

      <LegalSection id="s9" num="§9" title="Odstąpienie od Umowy">
        <h3>Prawo odstąpienia – zasada ogólna</h3>
        <p>
          Konsumentowi przysługuje prawo odstąpienia od Umowy zawartej na odległość w terminie{" "}
          <strong>14 dni</strong> od dnia zawarcia Umowy, bez podawania przyczyny i bez ponoszenia
          kosztów, z zastrzeżeniem wyjątku wskazanego poniżej.
        </p>

        <h3>Wyjątek dla treści cyfrowych</h3>
        <LegalCallout>
          <p>
            <strong>Ważne – utrata prawa odstąpienia przy natychmiastowej dostawie cyfrowej:</strong>{" "}
            na podstawie <strong>art. 38 ust. 1 pkt 13 Ustawy o prawach konsumenta</strong>, prawo
            odstąpienia od Umowy nie przysługuje Konsumentowi w odniesieniu do Umowy o dostarczanie
            treści cyfrowej (E-booka) lub świadczenie usługi cyfrowej (Planera Interaktywnego),
            jeżeli:
          </p>
          <p>
            1. spełnianie świadczenia (dostawa Produktu) rozpoczęło się za{" "}
            <strong>wyraźną zgodą Konsumenta</strong>, wyrażoną przed upływem terminu do odstąpienia
            od Umowy, oraz
          </p>
          <p>
            2. Konsument został <strong>poinformowany</strong> przed złożeniem zamówienia o utracie
            prawa odstąpienia i <strong>przyjął to do wiadomości</strong>.
          </p>
        </LegalCallout>
        <p>
          Warunki te są spełniane przez zaznaczenie przez Konsumenta stosownego checkboxa w
          formularzu zamówienia, w którym wyraża on zgodę na natychmiastowe dostarczenie Produktu i
          przyjmuje do wiadomości utratę prawa odstąpienia. Brak zaznaczenia checkboxa uniemożliwia
          sfinalizowanie zamówienia.
        </p>

        <h3>Jak skorzystać z prawa odstąpienia (gdy przysługuje)?</h3>
        <p>
          Jeżeli Konsument nie wyraził zgody na natychmiastowe dostarczenie treści cyfrowej lub
          spełnione są inne przesłanki prawa odstąpienia, Konsument może odstąpić od Umowy:
        </p>
        <ul>
          <li>
            przesyłając oświadczenie o odstąpieniu e-mailem na adres{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>,
          </li>
          <li>
            korzystając ze wzoru oświadczenia stanowiącego <a href="#zal1">Załącznik nr 1</a> do
            Regulaminu,
          </li>
          <li>
            przez formularz w sekcji <Link href="/pomoc">Pomoc</Link>, wybierając temat „Odstąpienie
            od umowy”.
          </li>
        </ul>
        <p>
          Do zachowania terminu wystarczy wysłanie oświadczenia przed jego upływem. Usługodawca
          niezwłocznie potwierdzi otrzymanie oświadczenia e-mailem.
        </p>

        <h3>Skutki odstąpienia</h3>
        <p>W przypadku skutecznego odstąpienia od Umowy:</p>
        <ul>
          <li>
            Usługodawca zwraca wszystkie dokonane płatności w terminie <strong>14 dni</strong> od
            otrzymania oświadczenia o odstąpieniu, tą samą metodą płatności, którą posłużył się
            Konsument (chyba że Konsument wyraźnie zgodzi się na inny sposób).
          </li>
          <li>
            Konsument zobowiązany jest do zaprzestania korzystania z Produktu, usunięcia pobranych
            plików i nieudostępniania ich osobom trzecim.
          </li>
        </ul>
        <p>Prawo odstąpienia od umowy nie przysługuje podmiotom niebędącym Konsumentami.</p>
      </LegalSection>

      <LegalSection id="s10" num="§10" title="Dane osobowe">
        <p>
          Administratorem danych osobowych Użytkowników jest <strong>{sellerName}</strong>. Kontakt:{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
        </p>
        <p>
          Szczegółowe informacje dotyczące przetwarzania danych osobowych, w tym celów i podstaw
          prawnych przetwarzania, okresu przechowywania danych, podmiotów, którym dane mogą być
          przekazywane, oraz przysługujących Użytkownikom praw, zawiera{" "}
          <Link href="/polityka-prywatnosci">
            <strong>Polityka Prywatności</strong>
          </Link>{" "}
          dostępna w Serwisie.
        </p>
        <p>
          Informacje dotyczące plików cookies i innych technologii śledzenia zawiera{" "}
          <Link href="/polityka-cookies">
            <strong>Polityka Cookies</strong>
          </Link>{" "}
          dostępna w Serwisie.
        </p>
      </LegalSection>

      <LegalSection id="s11" num="§11" title="Postanowienia końcowe">
        <h3>Zmiany Regulaminu</h3>
        <p>
          Usługodawca zastrzega sobie prawo zmiany Regulaminu z ważnych przyczyn, w szczególności w
          przypadku:
        </p>
        <ul>
          <li>zmian w obowiązujących przepisach prawa,</li>
          <li>istotnych zmian w zakresie świadczonych Usług,</li>
          <li>decyzji organów administracyjnych lub sądowych.</li>
        </ul>
        <p>
          O zmianach Regulaminu Usługodawca poinformuje Użytkowników posiadających Konto drogą
          e-mail z wyprzedzeniem co najmniej <strong>14 dni</strong> przed wejściem zmian w życie.
          Zmiany Regulaminu będą publikowane na stronie Serwisu z podaniem daty wejścia w życie.
          Dalsze korzystanie z Serwisu po upływie okresu wypowiedzenia oznacza akceptację nowego
          Regulaminu. Użytkownik, który nie akceptuje zmian, może wypowiedzieć Umowę o prowadzenie
          Konta zgodnie z §8.
        </p>

        <h3>Rozstrzyganie sporów</h3>
        <p>
          W przypadku sporów z Konsumentami, Usługodawca jest gotowy do próby polubownego
          rozwiązania sporu. Konsument uprawniony jest do:
        </p>
        <ul>
          <li>
            zwrócenia się do Stałego Polubownego Sądu Konsumenckiego przy właściwym Wojewódzkim
            Inspektoracie Inspekcji Handlowej,
          </li>
          <li>
            skorzystania z pozasądowych metod rozwiązywania sporów konsumenckich oraz wykazu
            właściwych podmiotów ADR dostępnego w serwisie{" "}
            <a href="https://polubowne.uokik.gov.pl/" target="_blank" rel="noopener noreferrer">
              polubowne.uokik.gov.pl
            </a>
            ,
          </li>
          <li>skierowania sprawy do właściwego sądu powszechnego.</li>
        </ul>

        <h3>Prawo właściwe i jurysdykcja</h3>
        <p>
          Do Umów zawieranych za pośrednictwem Serwisu stosuje się prawo polskie, z uwzględnieniem
          bezwzględnie obowiązujących przepisów prawa europejskiego. Dla sporów z podmiotami
          niebędącymi Konsumentami właściwy jest sąd właściwy dla siedziby Usługodawcy. Właściwość
          sądu dla sporów z Konsumentami określają przepisy Kodeksu postępowania cywilnego.
        </p>

        <h3>Postanowienia pozostałe</h3>
        <p>
          Jeżeli jakiekolwiek postanowienie Regulaminu okaże się nieważne lub bezskuteczne,
          pozostałe postanowienia pozostają w mocy. W miejsce postanowienia nieważnego stosuje się
          przepisy powszechnie obowiązującego prawa.
        </p>
        <p>
          Regulamin dostępny jest w Serwisie pod adresem{" "}
          <Link href="/regulamin">www.templify.pl/regulamin</Link> oraz na żądanie Użytkownika w
          wersji do wydruku lub plik PDF.
        </p>
        <p>
          Regulamin wchodzi w życie z dniem <strong>8 lipca 2026 r.</strong>
        </p>
      </LegalSection>

      <LegalAttachment
        id="zal1"
        label="Załącznik nr 1 do Regulaminu"
        title="Wzór oświadczenia o odstąpieniu od Umowy"
      >
        <p>
          W przypadku, gdy chce Pan/Pani odstąpić od Umowy, prosimy o wypełnienie poniższego wzoru i
          przesłanie go na adres <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. Przed
          skorzystaniem z prawa odstąpienia prosimy o sprawdzenie, czy nie ma zastosowania wyjątek z
          art. 38 ust. 1 pkt 13 UPK, opisany w §9 Regulaminu.
        </p>
        <div className="rounded-xl border border-border/70 bg-background/60 px-4 py-2">
          <LegalFormField
            label="Adresat (Usługodawca)"
            value={legalSellerContactLine(identity)}
          />
          <LegalFormField label="Ja/My (*) niniejszym informuję/informujemy (*) o moim/naszym (*) odstąpieniu od Umowy o dostarczenie następującej treści cyfrowej / świadczenie następującej usługi cyfrowej (*)" />
          <LegalFormField label="Numer zamówienia" />
          <LegalFormField label="Data zawarcia Umowy (data zakupu)" />
          <LegalFormField label="Imię i nazwisko Konsumenta(-ów)" />
          <LegalFormField label="Adres e-mail Konsumenta(-ów)" />
          <LegalFormField label="Adres Konsumenta(-ów) (opcjonalnie)" />
          <LegalFormField label="Data" />
          <LegalFormField label="Podpis (tylko jeżeli formularz jest przesyłany w wersji papierowej)" />
        </div>
        <p className="text-xs text-muted-foreground">(*) Niepotrzebne skreślić.</p>
      </LegalAttachment>

      <LegalAttachment id="zal2" label="Załącznik nr 2 do Regulaminu" title="Metody płatności w Serwisie">
        <p>
          Obsługę płatności w Serwisie zapewnia zewnętrzny operator płatności <strong>HotPay</strong>.
          Rozliczenia transakcji e-przelewem przeprowadzane są za pośrednictwem HotPay.
        </p>
        <ul>
          <li>
            <strong>Karta debetowa / kredytowa (Visa, Mastercard):</strong> płatność w PLN,
            realizacja natychmiastowa; dostępna, jeśli ta metoda została aktywowana dla Serwisu.
          </li>
          <li>
            <strong>BLIK:</strong> płatność w PLN, realizacja natychmiastowa; dostępny, jeśli ta
            metoda została aktywowana dla Serwisu.
          </li>
          <li>
            <strong>Przelew bankowy / Pay by Link:</strong> płatność w PLN, realizacja do 1 dnia
            roboczego; dostęp do Produktu po zaksięgowaniu wpłaty.
          </li>
          <li>
            <strong>Apple Pay / Google Pay:</strong> płatność w PLN, realizacja natychmiastowa;
            dostępność zależy od aktywacji metody, urządzenia i przeglądarki.
          </li>
        </ul>
        <p className="text-xs">
          Usługodawca zastrzega sobie prawo zmiany dostępnych metod płatności. Aktualna lista metod
          płatności zawsze widoczna jest na stronie płatności. Ewentualne koszty operacji bankowych
          po stronie Użytkownika (np. prowizje bankowe za przewalutowanie) są niezależne od
          Usługodawcy.
        </p>
      </LegalAttachment>
    </LegalShell>
  );
}
