-- Rewrite English storefront copy with premium Polish equivalents.
-- Idempotent: safe to re-run. Uses explicit per-slug UPDATE statements
-- so the intent is unambiguous in the Supabase SQL editor.

update public.products set
  name = 'Tydzień Założyciela w Notion',
  short_description = 'Tygodniowy system pracy dla założycieli, którzy chcą więcej spokoju, wyraźnych priorytetów i lepszych decyzji.',
  description = 'Premium workspace w Notion do planowania tygodnia, śledzenia decyzji, prowadzenia notatek ze spotkań i spokojniejszej realizacji. Dla osób, które chcą mniej chaosu i więcej sygnału w codziennej pracy.',
  format = 'Notion + PDF',
  sales_label = 'Ulubione wśród założycieli',
  hero_note = 'Przejmij tydzień, zanim on przejmie Ciebie.',
  includes = array['tygodniowy dashboard priorytetów', 'planer kluczowych decyzji', 'log spotkań i ustaleń'],
  tags = array['notion', 'planowanie', 'założyciel']
where slug = 'notion-ceo-week';

update public.products set
  name = 'Pakiet Onboardingu Klienta',
  short_description = 'Gotowe ścieżki wdrożenia klienta, ankiety i materiały dla studiów i agencji usługowych.',
  description = 'Dopracowany system onboardingu z formularzami briefu, pakietem kickoff i checklistami dostarczania. Idealny dla studiów, freelancerów i marek premium w modelu usługowym.',
  format = 'Docs + PDF + checklisty',
  sales_label = 'Najlepsze dla usług premium',
  hero_note = 'Wyglądaj profesjonalnie jeszcze przed pierwszą rozmową.',
  includes = array['formularz briefu i discovery', 'pakiet kickoff ze wzorami maili', 'szablony komunikacji z klientem'],
  tags = array['onboarding', 'obsługa-klienta', 'usługi']
where slug = 'client-onboarding-suite';

update public.products set
  name = 'Zestaw do Launchu Oferty',
  short_description = 'Szablony stron sprzedażowych, checklista launchu i copy oferty dla produktów cyfrowych.',
  description = 'Zorientowany na konwersję pakiet do launchu dla twórców i marek cyfrowych, którzy chcą czytelniejszej komunikacji, szybszego tworzenia strony i spokojniejszego tygodnia premiery.',
  format = 'PDF + gotowe copy',
  sales_label = 'Najszybsza droga do launchu',
  hero_note = 'Sprzedawaj efekt, a nie pracę.',
  includes = array['checklista launchu dzień po dniu', 'gotowe formuły copy dla oferty', 'bloki CTA i sekcje strony sprzedażowej'],
  tags = array['launch', 'sprzedaz', 'oferta']
where slug = 'launch-offer-kit';

update public.products set
  name = 'Silnik Contentu 90',
  short_description = 'Premium system planowania contentu, który zamienia strategię w 90 dni konkretnej realizacji.',
  description = 'Szablony do planowania kampanii, repurposingu i tygodniowej publikacji. Zbudowane, by małe zespoły mogły publikować konsekwentniej i z lepszą redakcyjną decyzyjnością.',
  format = 'Notion + PDF',
  sales_label = 'Bestseller do planowania contentu',
  hero_note = 'Zamień strategię w realne publikacje.',
  includes = array['mapa contentu na 90 dni', 'planer repurposingu wielokanałowego', 'tablica tygodniowej realizacji'],
  tags = array['content', 'marketing', 'repurposing']
where slug = 'content-engine-90';

update public.products set
  name = 'Pakiet Faktur i Cashflow',
  short_description = 'Szablony faktur, wyceny, śledzenia cashflow i rytuałów finansowych bez chaosu w arkuszach.',
  description = 'Operacyjny pakiet finansowy dla twórców i butikowych biznesów, którzy chcą czystych liczb, spokojniejszych przeglądów i większej pewności w decyzjach cenowych.',
  format = 'Arkusz + PDF',
  sales_label = 'Must-have operacyjny',
  hero_note = 'Zachowaj spokój w biznesowym zapleczu.',
  includes = array['workflow wystawiania faktur', 'tracker cashflow miesiąc po miesiącu', 'planer strategii cenowej'],
  tags = array['finanse', 'faktury', 'cashflow']
where slug = 'invoice-cashflow-pack';

update public.products set
  name = 'Pipeline CRM',
  short_description = 'Dopracowany pipeline sprzedażowy dla freelancerów, studiów i butikowych agencji.',
  description = 'Prowadź leady, follow-upy i propozycje w jednym przejrzystym workflow, który zwiększa widoczność bez zmiany w administracyjny kołowrotek.',
  format = 'Notion + tablica CRM',
  sales_label = 'Upgrade widoczności sprzedaży',
  hero_note = 'Zobacz co się porusza, a co utknęło.',
  includes = array['etapy leadów i kwalifikacja', 'szablony follow-upów e-mail', 'tracker propozycji i decyzji'],
  tags = array['crm', 'sprzedaz', 'pipeline']
where slug = 'crm-pipeline-template';

update public.products set
  name = 'Planner Focus Desk',
  short_description = 'Lekki, edytorski planner do głębokiej pracy, tygodniowych priorytetów i realizacji bez rozpraszaczy.',
  description = 'Zaprojektowany dla osób, które chcą bardziej świadomego dnia pracy — z mniejszą liczbą otwartych kart mentalnie i operacyjnie.',
  format = 'PDF do druku i iPada',
  sales_label = 'Najczęściej kupowany na prezent',
  hero_note = 'Czystszy dzień zaczyna się od lepszego systemu.',
  includes = array['planer głębokiej pracy', 'tygodniowy reset i przegląd', 'strony dnia bez rozpraszaczy'],
  tags = array['focus', 'produktywnosc', 'planowanie']
where slug = 'focus-desk-planner';

update public.products set
  name = 'Workbook Briefu Marki',
  short_description = 'Ustrukturyzowany warsztat do ułożenia strategii marki przed projektowaniem, copy i launchem.',
  description = 'Spokojny, profesjonalny workbook do doprecyzowania pozycjonowania, grupy odbiorców i kierunku kreatywnego, zanim zaczniesz jakiekolwiek prace projektowe.',
  format = 'PDF workbook',
  sales_label = 'Idealny warsztat przed projektem',
  hero_note = 'Klarowność przed projektem oszczędza tygodnie później.',
  includes = array['pytania pozycjonujące markę', 'arkusze pracy nad grupą docelową', 'notatki kierunku kreatywnego'],
  tags = array['marka', 'workbook', 'strategia']
where slug = 'brand-brief-workbook';

update public.products set
  name = 'Biblioteka Propozycji',
  short_description = 'Szablony propozycji, zakresu i wyceny, które pomagają zamykać projekty z większą pewnością.',
  description = 'Premium system propozycji dla usług produktyzowanych i butikowych współprac. Używaj, by skrócić czas odpowiedzi bez obniżania postrzeganej wartości.',
  format = 'Docs + PDF',
  sales_label = 'Start do zamykania większych projektów',
  hero_note = 'Zamykaj projekty premium z większą pewnością.',
  includes = array['szablony propozycji handlowych', 'scenariusze cenowe i pakietowania', 'framework zakresu współpracy'],
  tags = array['propozycja', 'wycena', 'sprzedaz']
where slug = 'proposal-template-library';

insert into public.site_sections (section_key, eyebrow, title, description, body, cta_label, cta_href, is_published)
values
  ('hero', 'Premium szablony cyfrowe', 'Szablony i systemy dla marek, które chcą wyglądać spokojnie, wiarygodnie i premium.', 'Sprzedajemy efekt, nie plik. Templify pakuje systemy, szablony i assety launchu w sklep zbudowany wokół zaufania i konwersji.', 'Stworzone dla twórców, butikowych studiów, konsultantów i marek cyfrowych, którzy chcą eleganckich systemów zamiast kolejnych folderów plików.', 'Przeglądaj katalog', '/produkty', true),
  ('featured', 'Polecane produkty', 'Zacznij od szablonów, które kupują zespoły, kiedy potrzebują szybkiego momentum.', 'Każdy produkt został zaprojektowany, by redukować tarcie, oszczędzać godziny i pomóc zespołowi wdrożyć zmianę szybciej i spokojniej.', '', 'Zobacz wszystkie produkty', '/produkty', true),
  ('use-cases', 'Kategorie', 'Wybierz system dla tej części biznesu, którą chcesz teraz uporządkować.', 'Od planowania w Notion i onboardingu klienta po launch kity, operacje finansowe i premium narzędzia produktywności.', '', 'Zobacz kategorie', '/produkty', true),
  ('why-templify', 'Dlaczego Templify', 'Elegancko, jak premium. Praktycznie, by realnie zmienić sposób pracy.', 'Sklep zbudowany wokół klarowności, zaufania i szybkości wdrożenia. Każdy szablon pozycjonujemy jako efekt biznesowy, nie kolejny folder plików.', 'Premium prezentacja ma znaczenie, ale tylko wtedy, gdy wspiera działanie. W Templify masz jedno i drugie.', null, null, true),
  ('how-it-works', 'Jak to działa', 'Wybierz, zapłać raz, pobierz natychmiast i wdroż system od razu.', 'Proces zakupu jest lekki, biblioteka dostępna od razu, a struktura gotowa, by rosnąć z Twoim katalogiem, pakietami i kampaniami.', '', null, null, true),
  ('faq', 'FAQ', 'Odpowiadamy na ostatnie pytania, zanim spowolnią checkout.', 'Sekcja, w której rozwiewamy wątpliwości dotyczące formatów, dostępu, licencji i wsparcia — jednym czytelnym blokiem.', '', null, null, true)
on conflict (section_key) do update set
  eyebrow = excluded.eyebrow,
  title = excluded.title,
  description = excluded.description,
  body = excluded.body,
  cta_label = excluded.cta_label,
  cta_href = excluded.cta_href,
  is_published = excluded.is_published;

delete from public.faq_items;

insert into public.faq_items (question, answer, sort_order, is_published) values
  ('W jakim formacie dostanę produkt?', 'W zależności od produktu otrzymasz plik PDF, workspace Notion, arkusz lub paczkę materiałów pomocniczych. Dokładny format jest zawsze opisany na karcie produktu.', 1, true),
  ('Jak szybko dostanę dostęp po zakupie?', 'Dostęp pojawia się automatycznie po potwierdzeniu płatności. Pliki znajdziesz w bibliotece swojego konta natychmiast — bez czekania i ręcznego wysyłania.', 2, true),
  ('Czy dostęp do plików jest bezterminowy?', 'Tak. Po zakupie masz dożywotni dostęp do produktu w swojej bibliotece i możesz pobierać go tyle razy, ile potrzebujesz.', 3, true),
  ('Czy mogę używać szablonów komercyjnie?', 'Tak, o ile opis produktu nie stanowi inaczej. Możesz używać szablonów w swoim biznesie lub pracy z klientami, ale nie możesz ich odsprzedawać jako własnych.', 4, true),
  ('Czy szablony są edytowalne?', 'Tak. Wszystkie szablony Notion, Docs i Sheets możesz zduplikować i edytować pod swoją markę. Pliki PDF są gotowe do druku lub użycia w wersji cyfrowej.', 5, true),
  ('Czy otrzymam fakturę VAT?', 'Tak. Fakturę VAT wystawiamy automatycznie po zakupie i wysyłamy na adres e-mail podany w zamówieniu.', 6, true),
  ('Czy mogę zwrócić zakup?', 'Masz 14 dni na zwrot bez podawania przyczyny. Wystarczy, że napiszesz do nas na kontakt@templify.store — zwrócimy całą kwotę.', 7, true),
  ('Czy mogę kupić produkt bez zakładania konta?', 'Checkout wymaga zalogowanego konta — dzięki temu wszystkie zakupy i pobrania są bezpiecznie przypisane do jednej biblioteki i zawsze je odnajdziesz.', 8, true);

delete from public.testimonials;

insert into public.testimonials (author, role, quote, score, sort_order, is_published) values
  ('Marta K.', 'założycielka studia brandingowego', 'Pakiet Onboardingu Klienta sprawił, że od pierwszej rozmowy wyglądamy wyraźnie bardziej premium. Przestaliśmy gubić etapy i proces klienta jest po prostu czystszy.', 5.0, 1, true),
  ('Kasia W.', 'twórczyni kursów online', 'Zestaw do Launchu Oferty skrócił mi przygotowanie kampanii o kilka dni. Wszystko było gotowe, eleganckie i spójne — od strony po maile.', 4.9, 2, true),
  ('Piotr Z.', 'freelance consultant', 'Pakiet Faktur i Cashflow dał mi prosty rytm finansowy bez przeprojektowywania całego zaplecza biznesu. Wreszcie wiem, co się dzieje z pieniędzmi.', 4.8, 3, true);
