# Run without Podman (plain frontend + backend on your machine)

Same app, same code, same features. You just start the two servers yourself.

```
Browser ──► http://localhost:5173 ──► [React dev server (Vite)]
                                          │  /api/*  is forwarded to
                                          ▼
                                   http://localhost:8080  [Spring Boot] ──► H2 file database
```

## 1. Prerequisites
| Tool | Check with | Needed |
|---|---|---|
| Java JDK | `java -version` | 17 or newer |
| Maven | `mvn -version` | 3.8+ |
| Node.js + npm | `node -v` and `npm -v` | Node 18+ |

## 2. Start the backend (Terminal 1)
```bash
cd ltm-joinee-system/backend
mvn spring-boot:run
```
Wait for `Started JoineeApplication`. The backend is now on **http://localhost:8080**.
The database is created automatically as files in `backend/data/` and is kept between restarts.

## 3. Start the frontend (Terminal 2)
```bash
cd ltm-joinee-system/frontend
npm install
npm run dev
```
Open **http://localhost:5173**.

React calls `/api/joinees` on port 5173. Vite (see `frontend/vite.config.js`) forwards `/api` to `http://localhost:8080`, so the code is identical to the container version and there is no CORS problem. (`CorsConfig.java` also allows `localhost:5173`, so a direct call would work too.)

## 4. Stop
Press `Ctrl + C` in each terminal.

## 5. Tests
Use the browser, with Terminal 1 visible (the backend prints each request).

| Test | Do this | Expected |
|---|---|---|
| Register | Fill the form, click Register | Green "Registered successfully (HTTP 201)" + details; form clears |
| Duplicate | Register the same PS ID again | Red "...already registered (HTTP 409)" |
| Verify | Check Joinee Details → existing PS ID | Green "Record found (HTTP 200)" + details |
| Not found | Check an unknown PS ID | Red "No joinee found... (HTTP 404)" |

Backend log lines to point out: `POST /api/joinees received`, `Saved joinee ...`, `GET /api/joinees/PS1001 received`, `404 - No joinee found...`.
Browser Console (F12) shows `[API] request ->` and `[API] response <-` for every call.

You can also test the backend alone:
```bash
curl -i http://localhost:8080/api/joinees/PS9999          # 404
curl -i -X POST http://localhost:8080/api/joinees -H "Content-Type: application/json" -d '{"joineeName":"Asha Verma","psId":"PS1001","projectId":"PRJ-204","projectName":"Retail Portal"}'    # 201
```
(On Windows PowerShell use `curl.exe` and put the JSON in a file, or just use the browser.)

## 6. Troubleshooting
| Problem | Fix |
|---|---|
| `Port 8080 was already in use` | Stop whatever uses it, or run `mvn spring-boot:run -Dspring-boot.run.arguments=--server.port=8081` and start the frontend with `VITE_DEV_BACKEND=http://localhost:8081 npm run dev` |
| UI shows "Cannot reach the server" or the Vite terminal prints `ECONNREFUSED` | The backend is not running. Start Terminal 1 first |
| `invalid target release: 17` | Your JDK is older than 17. Install JDK 17+ |
| Port 5173 busy | Vite picks the next port (5174) and prints it; open that URL. If you use another port, add it to `CorsConfig.java` only if you call the backend directly |
| Want a clean database | Stop the backend and delete the `backend/data` folder |
