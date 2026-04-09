Název projektu:
Moje síťová služba – AI chat

Autor:
Tomáš Hollý

Popis:
Projekt představuje jednoduchou síťovou službu běžící v Dockeru na Ubuntu Serveru.
Součástí je DNS server, DHCP server a jednoduchá webová aplikace s AI funkcí.

--------------------------------------------------

IP nastavení:
IP serveru: 10.10.10.1
Maska: 255.255.255.0

--------------------------------------------------

DHCP:
Realizováno pomocí dnsmasq

Rozsah:
10.10.10.100 – 10.10.10.150

Nastavení:
- DNS server: 10.10.10.1
- Gateway: 10.10.10.1

--------------------------------------------------

DNS:
Zóna: skola.test

A záznam:
holly.skola.test → 10.10.10.1

DNS server běží lokálně (127.0.0.1) pomocí dnsmasq.

--------------------------------------------------

Aplikace:
Technologie: Node.js (Express)

Port:
8081

Endpointy:
GET /ping
→ odpověď: pong

GET /status
→ vrací JSON (stav serveru, čas, autor)

POST /ai
→ vrací odpověď z lokálního AI modelu

--------------------------------------------------

AI:
Použito: Ollama

API:
http://localhost:11434/api

Model:
llama3.2:3b

Ukázkový příkaz:
curl http://localhost:11434/api/generate -d '{"model":"llama3.2:3b","prompt":"Ahoj","stream":false}'

--------------------------------------------------

Docker:
Aplikace běží v Docker kontejneru

Spuštění:
docker compose up --build

Port mapping:
8081:8081

--------------------------------------------------

Firewall:
Povolen port:
8081/tcp

--------------------------------------------------

Testování:

DNS:
ping holly.skola.test

Aplikace:
curl http://holly.skola.test:8081/ping

Status:
curl http://holly.skola.test:8081/status

AI:
curl -X POST http://holly.skola.test:8081/ai -H "Content-Type: application/json" -d '{"prompt":"Co je DNS?"}'

--------------------------------------------------

Popis fungování:

1. DHCP server přidělí klientovi IP adresu a DNS server
2. DNS server přeloží doménu holly.skola.test na IP serveru
3. Klient se připojí na IP:PORT (8081)
4. Aplikace odpovídá na HTTP požadavky
5. Endpoint /ai komunikuje s lokálním AI (Ollama)

--------------------------------------------------

Poznámky:

- Projekt běží v izolované síti bez internetu
- AI model běží lokálně na CPU
- node_modules není součástí repozitáře (řešeno přes .gitignore)
- veřejně dostupná verze je nyní upravená pro API uzaveřeného serveru s AI modelem gemma3:27b

--------------------------------------------------
