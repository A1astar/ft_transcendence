# JWT + Vault (implémentation de ce projet)

### De quoi parle ce document ?
Ce projet utilise **JWT (JSON Web Token)** pour l’authentification après connexion, et **HashiCorp Vault (KV v2)** pour gérer le secret de signature JWT **`jwt_secret`** (information sensible/clé). L’objectif est d’éviter d’embarquer un secret en dur dans le dépôt ou d’avoir un secret qui change à chaque redémarrage (ce qui invaliderait les tokens).

---

### Qu’est-ce qu’un JWT ? Comment est-il utilisé dans ce projet ?
- Un **JWT** est une chaîne signée (header.payload.signature).
- **Signature (sign)** : le serveur signe le payload avec `jwt_secret` pour produire un token.
- **Vérification (verify)** : le serveur vérifie la signature avec le même `jwt_secret` afin d’éviter toute modification du token.
- **Expiration (exp)** : le token a une durée de vie (par ex. 15 minutes). Une fois expiré, l’utilisateur doit se reconnecter.

Dans ce projet, le token est émis par le **service d’authentification** et renvoyé au navigateur sous forme de **cookie HttpOnly** :
- Nom du cookie : `access_token`
- Attributs : `HttpOnly`, `Secure`, `SameSite=Lax`
- Côté frontend, les appels API utilisent `credentials: "include"` pour que le navigateur envoie automatiquement le cookie.

---

### Pourquoi gérer le secret JWT avec Vault ?
Si `jwt_secret` n’est pas stable (par exemple généré aléatoirement à chaque démarrage), on rencontre :
- **Redémarrage du service → tous les tokens deviennent invalides** : les utilisateurs doivent se reconnecter.
- **Multi-conteneurs / multi-réplicas incompatibles** : un token signé par A échoue la vérification sur B si B n’a pas le même secret (401).

Stocker `jwt_secret` dans Vault (chiffrement + contrôle d’accès) apporte :
- **Stabilité** : toutes les instances lisent le même secret.
- **Pas de secret dans le repo** : évite de stocker la clé dans `.env` ou dans le code.
- **Contrôle des permissions** : seul le service autorisé peut lire/écrire.
- **Rotation possible** : on peut changer le secret (en gérant l’expiration des anciens tokens ou une stratégie de versioning).

---

### Où se trouve `jwt_secret` dans ce projet ?
Ce projet utilise le mount KV v2 `secret` :
- **Mount Vault** : `secret/` (KV v2)
- **Chemin des données (CLI/UI)** : `secret/authentication/jwt`
- **Champ** : `jwt_secret`

> Remarque : `secret/data/authentication/jwt` est le format **HTTP API** de KV v2. Dans la CLI/UI Vault, on utilise généralement `vault kv get secret/authentication/jwt`.

---

### Comment vérifier `jwt_secret` (recommandé : CLI dans le conteneur Vault)
#### Méthode A : utiliser directement le root token (évite les problèmes de persistance du token)
Exécuter sur la machine hôte :

```bash
docker exec -it transcendence-hashicorp-vault-1 sh
```

Dans le conteneur :

```sh
export VAULT_ADDR="https://127.0.0.1:8200"
export VAULT_CACERT="/vault/certs/ca.crt"
export VAULT_TOKEN="$(cat /vault/keys/root-token.txt)"

vault kv get secret/authentication/jwt
```

Vous devriez obtenir un résultat similaire (la clé est `jwt_secret`) :

```text
======= Data =======
Key         Value
---         -----
jwt_secret  <some-hex-secret>
```

#### Méthode B : utiliser `vault login` (se placer dans un répertoire inscriptible pour éviter `permission denied`)
```bash
docker exec -it transcendence-hashicorp-vault-1 sh
```

```sh
cd /tmp
export HOME=/tmp
export VAULT_ADDR="https://127.0.0.1:8200"
export VAULT_CACERT="/vault/certs/ca.crt"

vault login "$(cat /vault/keys/root-token.txt)"
vault kv get secret/authentication/jwt
```

---

### Comment `jwt_secret` est généré/écrit dans Vault ?
Au démarrage, le service d’authentification :
- tente d’abord de lire `jwt_secret` depuis `secret/authentication/jwt`
- si absent (et si la configuration dev/demo l’autorise), il génère un secret aléatoire une seule fois puis l’écrit dans Vault

Dans docker compose, ce projet active (dev/demo) l’auto-seed via :
- `AUTH_JWT_AUTO_SEED=true`

Ainsi, au premier démarrage, le log :
- `[auth] Seeded JWT secret to Vault`

indique que `jwt_secret` a bien été écrit dans Vault.

---

### Test rapide du cookie JWT (curl)
Exemple : inscription/connexion via API, puis appel à `/userinfo` avec le cookie :

```bash
BASE='https://localhost:8443'
EMAIL='test01@e.co'
USER='test01'
PASS='pass1234'

# register
curl -sk -H 'Content-Type: application/json' \
  --data "{\"email\":\"$EMAIL\",\"name\":\"$USER\",\"password\":\"$PASS\"}" \
  "$BASE/api/auth/register"

# login (save cookie)
curl -sk -i -c /tmp/tt_cookie.txt -H 'Content-Type: application/json' \
  --data "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}" \
  "$BASE/api/auth/login" | sed -n '1,40p'

# userinfo (send cookie)
curl -sk -i -b /tmp/tt_cookie.txt "$BASE/api/auth/userinfo" | sed -n '1,60p'
```

Si la connexion réussit, vous verrez dans les headers de réponse :
- `set-cookie: access_token=...`

et `/userinfo` devrait répondre `200`.

