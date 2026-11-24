# LTM Joinee Registration & Verification

React frontend and Spring Boot backend, each in its own Podman container, talking over REST.

```
Browser ──► localhost:3000 ──► [Container 1: frontend (nginx + React)]
                                      │  /api/*  → http://backend:8080   (Podman network, DNS name "backend")
                                      ▼
                               [Container 2: backend (Spring Boot)] ──► H2 database (volume)
```

> **Not using Podman?** See `RUN_WITHOUT_PODMAN.md` (two terminals: `mvn spring-boot:run` and `npm run dev`).

## 1. Run

Needs Podman 4+ and `podman compose` (or `podman-compose`).

```bash
cd ltm-joinee-system
podman compose up -d --build
podman ps                      # ltm-frontend and ltm-backend should both be Up
```
Open **http://localhost:3000**. (The first build takes a few minutes.)

```bash
podman compose stop            # stop
podman compose start           # start again (data is kept)
podman compose down            # remove containers (database volume is kept)
podman compose down -v         # remove containers AND the database
```

### Same thing without compose
```bash
podman build -t localhost/ltm-backend:1.0  ./backend
podman build -t localhost/ltm-frontend:1.0 ./frontend
podman network create ltm-net
podman volume create joinee-data
podman run -d --name backend  --network ltm-net -v joinee-data:/data -p 127.0.0.1:8080:8080 localhost/ltm-backend:1.0
podman run -d --name frontend --network ltm-net -p 3000:80 localhost/ltm-frontend:1.0
```
The backend container must be called `backend`, because `frontend/nginx.conf` forwards to `http://backend:8080`.

## 2. How the two containers talk (the key idea)

React runs in the **user's browser**, not inside the frontend container; the container only serves the files. So the browser cannot use `http://backend:8080` (that name exists only inside the Podman network), and `localhost:8080` only works by accident on your own machine.

Solution: **nginx reverse proxy**.
1. React calls a relative URL: `fetch('/api/joinees')`. The browser sends it to `localhost:3000` (the frontend container).
2. nginx (`frontend/nginx.conf`) sees `/api/` and forwards it to `http://backend:8080`. Inside the network the name `backend` resolves to the backend container.
3. Spring Boot answers; nginx hands the response back to the browser; React shows it.

**`localhost` inside a container is that container itself.** If nginx used `localhost:8080` it would look for a backend inside the frontend container and fail with 502. Containers on the same network reach each other by name (`backend`).

**Port mapping** `-p 3000:80` = host port 3000 → port 80 in the container. That is the only port the app needs. `127.0.0.1:8080:8080` is optional, just for `curl` debugging; container-to-container traffic uses the network, not published ports.

**CORS** is a browser rule: a page from one origin (`localhost:3000`) may not read responses from another origin (`localhost:8080`) unless the server allows it. Because the browser only talks to `localhost:3000` (nginx forwards the rest), requests are same-origin and CORS never triggers. `CorsConfig.java` is still included so a direct call (e.g. React dev server on `:5173`) also works.

## 3. REST API

| Request | Success | Failure |
|---|---|---|
| `POST /api/joinees` | 201 + saved joinee | 400 missing field, 409 duplicate PS ID, 500 server error |
| `GET /api/joinees/{psId}` | 200 + joinee | 404 not found, 500 server error |

Errors always look like `{"message": "..."}` and React displays that message.

## 4. Request → response example

**Register** (`Asha Verma / PS1001 / PRJ-204 / Retail Portal`):
1. React sends `POST /api/joinees` with the 4 fields as JSON.
2. nginx forwards it to the backend container.
3. `JoineeController` validates it → `JoineeService` checks the PS ID is new → `JoineeRepository` saves it in H2.
4. Spring Boot responds `201` + the saved record as JSON.
5. React receives it, shows "Registered successfully (HTTP 201)" and clears the form.

**Verify** `PS1001`: React sends `GET /api/joinees/PS1001` → backend looks it up → `200` + details, or `404` + `{"message":"No joinee found..."}`.

**Backend → frontend:** HTTP is request/response. The frontend always starts the conversation; the backend's data reaches React as the *response* (step 4–5). A server cannot open a connection to a browser by itself. To let the backend push updates on its own you would add **Server-Sent Events** (`SseEmitter` in Spring, `EventSource` in React) or **WebSockets** (`spring-boot-starter-websocket`, nginx `Upgrade` headers). That is not needed here.

## 5. Demo / tests

Terminal 1: `podman logs -f ltm-backend`  — Browser: http://localhost:3000

| Test | Do this | Browser shows | Backend log shows |
|---|---|---|---|
| 1 Register | Fill the form, click Register | Green "Registered successfully (HTTP 201)" + details | `POST /api/joinees received`, `Saved joinee ... 201` |
| 2 Duplicate | Register the same PS ID again | Red "...already registered (HTTP 409)" | `409 - PS ID PS1001 is already registered` |
| 3 Verify | Check Joinee Details → `PS1001` | Green "Record found (HTTP 200)" + details | `GET /api/joinees/PS1001 received` |
| 4 Not found | Check `PS9999` | Red "No joinee found... (HTTP 404)" | `404 - No joinee found...` |
| 5 Containers | commands below | | |

Test 5:
```bash
podman ps                                                       # two separate containers running
podman exec ltm-frontend wget -qO- http://backend:8080/api/joinees/PS1001   # frontend container reaches backend by name
podman logs --tail 20 ltm-backend                               # requests you made in the UI arrived here
podman logs --tail 20 ltm-frontend                              # nginx access log for the same requests
```
Browser DevTools → Console also prints `[API] request ->` and `[API] response <-` for every call.

## 6. Troubleshooting

```bash
podman ps -a                       # is everything running?
podman logs ltm-backend            # backend errors (look for "Started JoineeApplication")
podman logs ltm-frontend           # nginx errors
podman network inspect ltm-joinee-system_ltm-net   # both containers listed?
podman restart ltm-frontend
```
| Problem | Fix |
|---|---|
| 502 Bad Gateway on `/api/...` | Backend not up yet or wrong name. Check `podman logs ltm-backend`; the service must be called `backend`. |
| 502 after recreating only the backend | `podman restart ltm-frontend` (nginx remembers the old IP). |
| Frontend keeps restarting: `host not found in upstream "backend"` | Backend container missing or on a different network. Start backend first, same network. |
| "Cannot reach the server" in UI | Use `http://localhost:3000`; check `podman ps`. |
| Console says "blocked by CORS policy" | Browser is calling the backend directly; use `/api` or add the origin in `CorsConfig.java`. |
| Port already in use | Change the left number in `3000:80`. |

## 7. Project structure
```
compose.yaml
backend/   Dockerfile, pom.xml, src/main/java/com/ltm/joinee/{entity,repository,service,controller,dto,exception,config}
frontend/  Dockerfile, nginx.conf, package.json, src/{App.jsx, components/, services/ApiService.js}
```
Local development without containers: `cd backend && mvn spring-boot:run`, then `cd frontend && npm install && npm run dev` (Vite proxies `/api` to `localhost:8080`).
