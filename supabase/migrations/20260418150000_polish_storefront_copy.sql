-- Rewrite English storefront copy with premium Polish equivalents.
-- Safe to re-run; uses idempotent upserts/updates keyed by stable identifiers.

update public.products
set
  name = case slug
    when 'notion-ceo-week' then 'Tydzień Założyciela w Notion'
    when 'client-onboarding-suite' then 'Pakiet Onboardingu Klienta'
    when 'launch-offer-kit' then 'Zestaw do Launchu Oferty'
    when 'content-engine-90' then 'Silnik Contentu 90'
    when 'invoice-cashflow-pack' then 'Pakiet Faktur i Cashflow'
    when 'crm-pipeline-template' then 'Pipeline CRM'
    when 'focus-desk-planner' then 'Planner Focus Desk'
    when 'brand-brief-workbook' then 'Workbook Briefu Marki'
    when 'proposal-template-library' then 'Biblioteka Propozycji'
    else name
  end,
  short_description = case slug
    when 'notion-ceo-week' then 'Tygodniowy system pracy dla założycieli, którzy chcą więcej spokoju, wyraźnych priorytetów i lepszych decyzji.'
    when 'client-onboarding-suite' then 'Gotowe ścieżki wdrożenia klienta, ankiety i materiały dla studiów i agencji usługowych.'
    when 'launch-offer-kit' then 'Szablony stron sprzedażowych, checklista launchu i copy oferty dla produktów cyfrowych.'
    when 'content-engine-90' then 'Premium system planowania contentu, który zamienia strategię w 90 dni konkretnej realizacji.'
    when 'invoice-cashflow-pack' then 'Szablony faktur, wyceny, śledzenia cashflow i rytuałów finansowych bez chaosu w arkuszach.'
    when 'crm-pipeline-template' then 'Dopracowany pipeline sprzedażowy dla freelancerów, studiów i butikowych agencji.'
    when 'focus-desk-planner' then 'Lekki, edytorski planner do głębokiej pracy, tygodniowych priorytetów i realizacji bez rozpraszaczy.'
    when 'brand-brief-workbook' then 'Ustrukturyzowany warsztat do ułożenia strategii marki przed projektowaniem, copy i launchem.'
    when 'proposal-template-library' then 'Szablony propozycji, zakresu i wyceny, które pomagają zamykać projekty z większą pewnością.'
    else short_description
  end,
  description = case slug
    when 'notion-ceo-week' then 'Premium workspace w Notion do planowania tygodnia, śledzenia decyzji, prowadzenia notatek ze spotkań i spokojniejszej realizacji. Dla osób, które chcą mniej chaosu i więcej sygnału w codziennej pracy.'
    when 'client-onboarding-suite' then 'Dopracowany system onboardingu z formularzami briefu, pakietem kickoff i checklistami dostarczania. Idealny dla studiów, freelancerów i marek premium w modelu usługowym.'
    when 'launch-offer-kit' then 'Zorientowany na konwersję pakiet do launchu dla twórców i marek cyfrowych, którzy chcą czytelniejszej komunikacji, szybszego tworzenia strony i spokojniejszego tygodnia premiery.'
    when 'content-engine-90' then 'Szablony do planowania kampanii, repurposingu i tygodniowej publikacji. Zbudowane, by małe zespoły mogły publikować konsekwentniej i z lepszą redakcyjną decyzyjnością.'
    when 'invoice-cashflow-pack' then 'Operacyjny pakiet finansowy dla twórców i butikowych biznesów, którzy chcą czystych liczb, spokojniejszych przeglądów i większej pewności w decyzjach cenowych.'
    when 'crm-pipeline-template' then 'Prowadź leady, follow-upy i propozycje w jednym przejrzystym workflow, który zwiększa widoczność bez zmiany w administracyjny kołowrotek.'
    when 'focus-desk-planner' then 'Zaprojektowany dla osób, które chcą bardziej świadomego dnia pracy — z mniejszą liczbą otwartych kart mentalnie i operacyjnie.'
    when 'brand-brief-workbook' then 'Spokojny, profesjonalny workbook do doprecyzowania pozycjonowania, grupy odbiorców i kierunku kreatywnego, zanim zaczniesz jakiekolwiek prace projektowe.'
    when 'proposal-template-library' then 'Premium system propozycji dla usług produktyzowanych i butikowych współprac. Używaj, by skrócić czas odpowiedzi bez obniżania postrzeganej wartości.'
    else description
  end,
  format = case slug
    when 'notion-ceo-week' then 'Notion + PDF'
    when 'client-onboarding-suite' then 'Docs + PDF + checklisty'
    when 'launch-offer-kit' then 'PDF + gotowe copy'
    when 'content-engine-90' then 'Notion + PDF'
    when 'invoice-cashflow-pack' then 'Arkusz + PDF'
    when 'crm-pipeline-template' then 'Notion + tablica CRM'
    when 'focus-desk-planner' then 'PDF do druku i iPada'
    when 'brand-brief-workbook' then 'PDF workbook'
    when 'proposal-template-library' then 'Docs + PDF'
    else format
  end,
  sales_label = case slug
    when 'notion-ceo-week' then 'Ulubione wśród założycieli'
    when 'client-onboarding-suite' then 'Najlepsze dla usług premium'
    when 'launch-offer-kit' then 'Najszybsza droga do launchu'
    when 'content-engine-90' then 'Bestseller do planowania contentu'
    when 'invoice-cashflow-pack' then 'Must-have operacyjny'
    when 'crm-pipeline-template' then 'Upgrade widoczności sprzedaży'
    when 'focus-desk-planner' then 'Najczęściej kupowany na prezent'
    when 'brand-brief-workbook' then 'Idealny warsztat przed projektem'
    when 'proposal-template-library' then 'Start do zamykania większych projektów'
    else sales_label
  end,
  hero_note = case slug
    when 'notion-ceo-week' then 'Przejmij tydzień, zanim on przejmie Ciebie.'
    when 'client-onboarding-suite' then 'Wyglądaj profesjonalnie jeszcze przed pierwszą rozmową.'
    when 'launch-offer-kit' then 'Sprzedawaj efekt, a nie pracę.'
    when 'content-engine-90' then 'Zamień strategię w realne publikacje.'
    when 'invoice-cashflow-pack' then 'Zachowaj spokój w biznesowym zapleczu.'
    when 'crm-pipeline-template' then 'Zobacz co się porusza, a co utknęło.'
    when 'focus-desk-planner' then 'Czystszy dzień zaczyna się od lepszego systemu.'
    when 'brand-brief-workbook' then 'Klarowność przed projektem oszczędza tygodnie później.'
    when 'proposal-template-library' then 'Zamykaj projekty premium z większą pewnością.'
    else hero_note
  end,
  includes = case slug
    when 'notion-ceo-week' then array['tygodniowy dashboard priorytetów', 'planer kluczowych decyzji', 'log spotkań i ustaleń']
    when 'client-onboarding-suite' then array['formularz briefu i discovery', 'pakiet kickoff ze wzorami maili', 'szablony komunikacji z klientem']
    when 'launch-offer-kit' then array['checklista launchu dzień po dniu', 'gotowe formuły copy dla oferty', 'bloki CTA i sekcje strony sprzedażowej']
    when 'content-engine-90' then array['mapa contentu na 90 dni', 'planer repurposingu wielokanałowego', 'tablica tygodniowej realizacji']
    when 'invoice-cashflow-pack' then array['workflow wystawiania faktur', 'tracker cashflow miesiąc po miesiącu', 'planer strategii cenowej']
    when 'crm-pipeline-template' then array['etapy leadów i kwalifikacja', 'szablony follow-upów e-mail', 'tracker propozycji i decyzji']
    when 'focus-desk-planner' then array['planer głębokiej pracy', 'tygodniowy reset i przegląd', 'strony dnia bez rozpraszaczy']
    when 'brand-brief-workbook' then array['pytania pozycjonujące markę', 'arkusze pracy nad grupą docelową', 'notatki kierunku kreatywnego']
    when 'proposal-template-library' then array['szablony propozycji handlowych', 'scenariusze cenowe i pakietowania', 'framework zakresu współpracy']
    else includes
  end,
  tags = case slug
    when 'notion-ceo-week' then array['notion', 'planowanie', 'założyciel']
    when 'client-onboarding-suite' then array['onboarding', 'obsługa-klienta', 'usługi']
    when 'launch-offer-kit' then array['launch', 'sprzedaz', 'oferta']
    when 'content-engine-90' then array['content', 'marketing', 'repurposing']
    when 'invoice-cashflow-pack' then array['finanse', 'faktury', 'cashflow']
    when 'crm-pipeline-template' then array['crm', 'sprzedaz', 'pipeline']
    when 'focus-desk-planner' then array['focus', 'produktywnosc', 'planowanie']
    when 'brand-brief-workbook' then array['marka', 'workbook', 'strategia']
    when 'proposal-template-library' then array['propozycja', 'wycena', 'sprzedaz']
    else tags
  end;

insert into public.site_sections (section_key, eyebrow, title, description, body, cta_label, cta_href, is_published)
values
  ('hero', 'Premium szablony cyfrowe', 'Szablony i systemy dla marek, które chcą wyglądać spokojnie, wiarygodnie i premium.', 'Sprzedajemy efekt, nie plik. Templify pakuje systemy, szablony i assety launchu w sklep zbudowany wokół zaufania i konwersji.', 'Stworzone dla twórców, butikowych studiów, konsultantów i marek cyfrowych, którzy chcą eleganckich systemów zamiast kolejnych folderów plików.', 'Przeglądaj katalog', '/produkty', true),
  ('featured', 'Polecane produkty', 'Zacznij od szablonów, które kupują zespoły, kiedy potrzebują szybkiego momentum.', 'Każdy produkt został zaprojektowany, by redukować tarcie, oszczędzać godziny i pomóc zespołowi wdrożyć zmianę szybciej i spokojniej.', '', 'Zobacz wszystkie produkty', '/produkty', true),
  ('use-cases', 'Kategorie', 'Wybierz system dla tej części biznesu, którą chcesz teraz uporządkować.', 'Od planowania w Notion i onboardingu klienta po launch kity, operacje finansowe i premium narzędzia produktywności.', '', 'Zobacz kategorie', '/produkty', true),
  ('why-templify', 'Dlaczego Templify', 'Elegancko, jak premium. Praktycznie, by realnie zmienić sposób pracy.', 'Sklep zbudowany wokół klarowności, zaufania i szybkości wdrożenia. Każdy szablon pozycjonujemy jako efekt biznesowy, nie kolejny folder plików.', 'Premium prezentacja ma znaczenie, ale tylko wtedy, gdy wspiera działanie. W Templify masz jedno i drugie.', null, null, true),
  ('how-it-works', 'Jak to działa', 'Wybierz, zapłać raz, pobierz natychmiast i wdroż system od razu.', 'Proces zakupu jest lekki, biblioteka dostępna od razu, a struktura gotowa, by rosnąć z Twoim katalogiem, pakietami i kampaniami.', '', null, null, true),
  ('faq', 'FAQ', 'Odpowiadamy na ostatnie pytania, zanim spowolnią checkout.', 'Sekcja, w której rozwiewamy wątpliwości dotyczące formatów, dostępu, licencji i wsparcia — jednym czytelnym blokiem.', '', null, null, true)
on conflict (section_key) do update
set eyebrow = excluded.eyebrow,
    title = excluded.title,
    description = excluded.description,
    body = excluded.body,
    cta_label = excluded.cta_label,
    cta_href = excluded.cta_href,
    is_published = excluded.is_published;

-- Replace English seed FAQs and testimonials with Polish canonical set.
delete from public.faq_items;

insert into public.faq_items (question, answer, sort_order, is_published)
values
  ('W jakim formacie dostanę produkt?', 'W zależności od produktu otrzymasz plik PDF, workspace Notion, arkusz lub paczkę materiałów pomocniczych. Dokładny format jest zawsze opisany na karcie produktu.', 1, true),
  ('Jak szybko dostanę dostęp po zakupie?', 'Dostęp pojawia się automatycznie po potwierdzeniu płatności. Pliki znajdziesz w bibliotece swojego konta natychmiast — bez czekania i ręcznego wysyłania.', 2, true),
  ('Czy dostęp do plików jest bezterminowy?', 'Tak. Po zakupie masz dożywotni dostęp do produktu w swojej bibliotece i możesz pobierać go tyle razy, ile potrzebujesz.', 3, true),
  ('Czy mogę używać szablonów komercyjnie?', 'Tak, o ile opis produktu nie stanowi inaczej. Możesz używać szablonów w swoim biznesie lub pracy z klientami, ale nie możesz ich odsprzedawać jako własnych.', 4, true),
  ('Czy szablony są edytowalne?', 'Tak. Wszystkie szablony Notion, Docs i Sheets możesz zduplikować i edytować pod swoją markę. Pliki PDF są gotowe do druku lub użycia w wersji cyfrowej.', 5, true),
  ('Czy otrzymam fakturę VAT?', 'Tak. Fakturę VAT wystawiamy automatycznie po zakupie i wysyłamy na adres e-mail podany w zamówieniu.', 6, true),
  ('Czy mogę zwrócić zakup?', 'Masz 14 dni na zwrot bez podawania przyczyny. Wystarczy, że napiszesz do nas na kontakt@templify.store — zwrócimy całą kwotę.', 7, true),
  ('Czy mogę kupić produkt bez zakładania konta?', 'Checkout wymaga zalogowanego konta — dzięki temu wszystkie zakupy i pobrania są bezpiecznie przypisane do jednej biblioteki i zawsze je odnajdziesz.', 8, true)
on conflict do nothing;

delete from public.testimonials;

insert into public.testimonials (author, role, quote, score, sort_order, is_published)
values
  ('Marta K.', 'założycielka studia brandingowego', 'Pakiet Onboardingu Klienta sprawił, że od pierwszej rozmowy wyglądamy wyraźnie bardziej premium. Przestaliśmy gubić etapy i proces klienta jest po prostu czystszy.', 5.0, 1, true),
  ('Kasia W.', 'twórczyni kursów online', 'Zestaw do Launchu Oferty skrócił mi przygotowanie kampanii o kilka dni. Wszystko było gotowe, eleganckie i spójne — od strony po maile.', 4.9, 2, true),
  ('Piotr Z.', 'freelance consultant', 'Pakiet Faktur i Cashflow dał mi prosty rytm finansowy bez przeprojektowywania całego zaplecza biznesu. Wreszcie wiem, co się dzieje z pieniędzmi.', 4.8, 3, true)
on conflict do nothing;
