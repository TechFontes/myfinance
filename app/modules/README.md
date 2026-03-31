# app/modules

Cada pasta em app/modules representa um dominio funcional do produto.

Regras:
- UI nao acessa Prisma diretamente
- validacao e regras de negocio vivem no modulo
- rotas chamam servicos do modulo
- calculos financeiros nao ficam espalhados em paginas
