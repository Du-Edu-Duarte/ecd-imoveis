# ECD Imóveis

Vitrine de imóveis para **corretores e imobiliárias**. Cada imóvel ganha uma página com **tour por cômodo**, comparação **antes e depois** (vazio x mobiliado ou reformado), **montagem de móveis** sobre a foto, simulador de financiamento e **agendamento de visita pelo WhatsApp**. Os pedidos de visita viram leads num painel.

**Demonstração:** https://du-edu-duarte.github.io/ecd-imoveis/

> Versão de demonstração. Imóveis e contatos são fictícios, e as imagens são ilustrações próprias feitas em SVG. Tudo fica salvo apenas no navegador de quem está usando.

## O que ele faz

**Página do imóvel (aberta para qualquer pessoa)**
- Tour por cômodo com miniaturas, setas e teclado (← →), além de tela cheia.
- **Original / Projeto / Comparar:** uma barra arrastável mostra o antes e o depois do cômodo.
- **Montar:** o visitante arrasta móveis (sofá, cama, mesa, TV, plantas…) sobre a foto, muda o tamanho e remove. A montagem fica salva no navegador dele.
- Preço, condomínio, IPTU e total do aluguel, ficha técnica, descrição e diferenciais.
- **Simulador de financiamento** (Price e SAC) com renda sugerida.
- **Agendar visita:** dia e período, que abrem o WhatsApp do corretor com a mensagem pronta. Também dá para compartilhar o imóvel.

**Painel do corretor (com login)**
- Imóveis com situação (disponível, reservado, vendido), visualizações e leads.
- Cadastro do imóvel com fotos **originais e de projeto** por cômodo, ordem do tour e foto de capa.
- **Leads e visitas** com situação (novo, contatado, visita marcada, proposta) e botão de WhatsApp.
- Acesso só para clientes, com o mesmo login com convite dos outros sistemas ECD, e tema preto e branco.

## Tecnologias

HTML, CSS e JavaScript puro · ilustrações SVG geradas no código (`rooms.js`) · IndexedDB para dados e fotos · GitHub Pages

## Rodar localmente

```bash
python3 -m http.server 8000
```

## Versão para empresas

Na versão para empresas, os imóveis, as fotos e os leads ficam num servidor. Assim os pedidos de visita de qualquer pessoa chegam ao painel do corretor, e a página pode ter domínio próprio da imobiliária.

## Autor

**Eduardo Costa Duarte** · [ECD Tecnologia](https://www.instagram.com/ecdtecnologia/) · [LinkedIn](https://www.linkedin.com/in/eduardo-costa-0a0b462a8)
