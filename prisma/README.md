# Prisma Database Management

## Seed

O arquivo `seed.ts` é usado para popular o banco de dados com dados iniciais para desenvolvimento.

### Como usar

```bash
# Executar o seed
bunx prisma db seed

# Resetar o banco e executar o seed
bunx prisma migrate reset
```

### O que o seed cria

O seed atual cria a barbershop **"Estilo & Classe Barbearia"** com:

- **Slug:** `EstiloClasse`
- **3 Barbeiros:**
  - Carlos (Especialista em Cortes Clássicos)
  - Miguel (Mestre em Barbas e Bigodes)
  - André (Expert em Cortes Modernos)
- **4 Serviços:**
  - Corte Clássico (€20, 30min)
  - Barba Completa (€15, 25min)
  - Corte + Barba (€30, 45min)
  - Hidratação Capilar (€25, 40min)

### Acessar a barbershop

Após executar o seed, você pode acessar a barbershop em:
```
http://localhost:3000/EstiloClasse
```

### Prisma Studio

Para visualizar e editar os dados no banco:

```bash
bunx prisma studio
```

Isso abrirá uma interface web em `http://localhost:5555`.
