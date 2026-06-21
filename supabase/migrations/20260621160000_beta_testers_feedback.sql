alter table public.profiles
add column if not exists is_tester boolean not null default false;

create table if not exists public.tester_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  category text not null default 'bug' check (category in ('bug', 'idea', 'ux', 'content')),
  message text not null check (char_length(message) between 3 and 4000),
  page_url text not null,
  user_agent text,
  viewport text,
  screenshot_path text,
  status text not null default 'new' check (status in ('new', 'reviewing', 'resolved', 'rejected')),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists tester_feedback_user_id_idx
on public.tester_feedback (user_id, created_at desc);

alter table public.tester_feedback enable row level security;

drop policy if exists "tester_feedback_insert_own" on public.tester_feedback;
create policy "tester_feedback_insert_own"
on public.tester_feedback for insert to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.is_tester = true
  )
);

drop policy if exists "tester_feedback_select_own_or_admin" on public.tester_feedback;
create policy "tester_feedback_select_own_or_admin"
on public.tester_feedback for select to authenticated
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "tester_feedback_update_admin" on public.tester_feedback;
create policy "tester_feedback_update_admin"
on public.tester_feedback for update to authenticated
using (public.is_admin()) with check (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'tester-feedback',
  'tester-feedback',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "tester_feedback_assets_admin_read" on storage.objects;
create policy "tester_feedback_assets_admin_read"
on storage.objects for select to authenticated
using (bucket_id = 'tester-feedback' and public.is_admin());

update public.content_pages
set
  title = 'Regulamin sklepu internetowego Templify',
  description = 'Zasady zakupów, dostarczania treści cyfrowych i korzystania z interaktywnych planerów Templify.',
  body = $terms$
§ 1. Postanowienia ogólne
Regulamin określa zasady korzystania ze sklepu internetowego Templify, zawierania umów na odległość oraz dostarczania e-booków, szablonów, interaktywnych planerów i innych treści lub usług cyfrowych. Sprzedawcą jest podmiot wskazany w sekcji „Operator sklepu”. Kontakt w sprawach zamówień, reklamacji i praw konsumenta odbywa się przez adres e-mail podany na stronie.

§ 2. Definicje
Klient oznacza osobę fizyczną, osobę prawną albo jednostkę organizacyjną dokonującą zakupu. Konsument oznacza osobę fizyczną dokonującą czynności niezwiązanej bezpośrednio z jej działalnością gospodarczą lub zawodową; postanowienia dotyczące konsumenta stosuje się również do przedsiębiorcy na prawach konsumenta w zakresie wynikającym z przepisów. Produkt cyfrowy oznacza treść cyfrową lub usługę cyfrową oferowaną w Sklepie. Konto oznacza indywidualny profil Klienta, w którym udostępniana jest biblioteka zakupów i zapisane dane planerów.

§ 3. Wymagania techniczne
Do korzystania ze Sklepu potrzebne są aktualna przeglądarka internetowa, dostęp do Internetu, aktywny adres e-mail oraz urządzenie obsługujące pliki PDF lub HTML. Interaktywne planery wymagają włączonej obsługi JavaScript i zalogowania do Konta. Klient powinien we własnym zakresie dbać o aktualność systemu, przeglądarki i bezpieczeństwo danych logowania.

§ 4. Konto użytkownika
Założenie Konta jest bezpłatne. Klient podaje prawdziwe dane, chroni hasło i nie udostępnia Konta osobom trzecim. Jedno Konto jest przeznaczone dla jednego Klienta, chyba że opis Produktu wyraźnie przewiduje licencję zespołową. Klient może zażądać usunięcia Konta, z zastrzeżeniem danych, które Sprzedawca musi przechowywać na podstawie prawa podatkowego, rachunkowego lub w celu obrony roszczeń.

§ 5. Składanie zamówień i płatności
Informacje o Produktach i cenach stanowią zaproszenie do zawarcia umowy. Klient składa zamówienie po wybraniu Produktów, zalogowaniu się, podaniu wymaganych danych, zaakceptowaniu Regulaminu i obowiązku zapłaty. Ceny są cenami brutto w PLN, o ile Sklep nie wskazuje inaczej. Płatności obsługuje zewnętrzny operator płatności wskazany w procesie zakupowym. Umowa zostaje zawarta po skutecznym potwierdzeniu płatności i przyjęciu zamówienia przez Sprzedawcę.

§ 6. Dostarczanie produktów cyfrowych
Produkt cyfrowy jest dostarczany niezwłocznie po zaksięgowaniu płatności przez udostępnienie go w bibliotece Konta lub przesłanie linku na adres e-mail. Sprzedawca potwierdza zawarcie umowy na trwałym nośniku. Dostęp bezterminowy oznacza dostęp przez okres prowadzenia Sklepu i utrzymywania danej usługi, z uwzględnieniem obowiązków ustawowych oraz możliwości pobrania pliku, jeżeli Produkt oferuje pobieranie.

§ 7. Prawo odstąpienia i dobrowolna gwarancja zwrotu
Konsument co do zasady może odstąpić od umowy zawartej na odległość w terminie 14 dni. W przypadku treści cyfrowej niedostarczanej na nośniku materialnym prawo to wygasa po rozpoczęciu świadczenia, jeżeli Konsument uprzednio wyraźnie zgodził się na rozpoczęcie dostarczania przed upływem terminu, przyjął do wiadomości utratę prawa odstąpienia i otrzymał potwierdzenie. Niezależnie od ustawowych praw Sprzedawca może oferować dobrowolną gwarancję zwrotu na warunkach opisanych przy Produkcie; gwarancja ta nie ogranicza praw wynikających z niezgodności Produktu z umową.

§ 8. Zgodność treści i usług cyfrowych z umową
Sprzedawca dostarcza Produkt zgodny z opisem, funkcjonalnością, kompatybilnością i przeznaczeniem podanym przed zakupem. Zapewnia aktualizacje, w tym aktualizacje bezpieczeństwa, niezbędne do zachowania zgodności przez okres wymagany prawem lub wskazany w ofercie. W razie braku zgodności Konsument może żądać doprowadzenia Produktu do zgodności, a w przypadkach przewidzianych prawem również obniżenia ceny lub odstąpienia od umowy. Uprawnień ustawowych nie wyłącza licencja ani gwarancja handlowa.

§ 9. Reklamacje
Reklamację można złożyć e-mailem, podając dane pozwalające zidentyfikować zamówienie, opis problemu, oczekiwany sposób rozwiązania i — jeśli to pomocne — screenshot. Sprzedawca odpowiada Konsumentowi w terminie 14 dni. Brak odpowiedzi w ustawowym terminie wywołuje skutki określone prawem. Reklamacje techniczne planerów powinny zawierać nazwę urządzenia i przeglądarki; nie jest to warunek rozpatrzenia reklamacji.

§ 10. Licencja i własność intelektualna
Zakup udziela Klientowi niewyłącznej, nieprzenoszalnej licencji do osobistego lub wewnętrznego użytku Produktu zgodnie z opisem oferty. Bez pisemnej zgody Sprzedawcy zabronione są odsprzedaż, publiczne udostępnianie, masowe kopiowanie, usuwanie oznaczeń autorstwa, przekazywanie plików osobom trzecim oraz wykorzystywanie Produktu do tworzenia konkurencyjnych materiałów przeznaczonych do sprzedaży. Dozwolone jest wykonanie kopii zapasowej na potrzeby własne.

§ 11. Interaktywne planery i dane użytkownika
Dane wpisywane do interaktywnych planerów są przypisane do Konta Klienta i zapisywane w celu świadczenia usługi. Klient odpowiada za legalność wprowadzanych treści i nie powinien przechowywać danych szczególnych kategorii ani danych osób trzecich bez podstawy prawnej. Sprzedawca stosuje środki techniczne służące ochronie danych, lecz Klient powinien zachować własne kopie informacji o krytycznym znaczeniu.

§ 12. Niedozwolone korzystanie
Zabronione są próby obchodzenia zabezpieczeń, uzyskiwania dostępu do cudzych Kont, zakłócania działania Sklepu, automatycznego pobierania w nadmiernej skali, przesyłania złośliwego kodu oraz korzystania ze Sklepu z naruszeniem prawa lub praw osób trzecich. Sprzedawca może czasowo ograniczyć dostęp niezbędny do ochrony usługi, po uprzednim ostrzeżeniu, o ile natychmiastowe działanie nie jest konieczne ze względów bezpieczeństwa.

§ 13. Odpowiedzialność
Sprzedawca odpowiada wobec Konsumenta na zasadach bezwzględnie obowiązującego prawa. Informacje edukacyjne w e-bookach i planerach nie zastępują indywidualnej porady prawnej, medycznej, podatkowej ani inwestycyjnej. W relacjach z Klientami niebędącymi konsumentami odpowiedzialność Sprzedawcy może być ograniczona do wartości zamówienia, z wyjątkiem szkody wyrządzonej umyślnie i przypadków, w których ograniczenie jest niedopuszczalne.

§ 14. Pozasądowe sposoby rozwiązywania sporów
Konsument może skorzystać z pomocy miejskiego lub powiatowego rzecznika konsumentów, właściwego Wojewódzkiego Inspektoratu Inspekcji Handlowej oraz informacji dostępnych na stronie Prezesa UOKiK. Skorzystanie z pozasądowego sposobu rozwiązania sporu jest dobrowolne, chyba że przepis szczególny stanowi inaczej.

§ 15. Zmiany Regulaminu
Sprzedawca może zmienić Regulamin z ważnych przyczyn, w szczególności zmiany prawa, funkcjonalności Sklepu, sposobów płatności lub wymogów bezpieczeństwa. Zmiany nie naruszają praw nabytych ani warunków zamówień już złożonych. Użytkownicy usług ciągłych są informowani o zmianach na trwałym nośniku z wyprzedzeniem wymaganym prawem.

§ 16. Postanowienia końcowe
Do umów stosuje się prawo polskie, bez pozbawiania Konsumenta ochrony przyznanej mu przez bezwzględnie obowiązujące przepisy państwa zwykłego pobytu. W sprawach nieuregulowanych zastosowanie mają w szczególności Kodeks cywilny, ustawa o prawach konsumenta oraz przepisy o świadczeniu usług drogą elektroniczną. Regulamin obowiązuje od 21 czerwca 2026 r.
$terms$,
  updated_at = timezone('utc', now())
where slug = 'regulamin';
