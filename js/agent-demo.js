/* Roteiros da demonstração do agente de IA. Produtos, preços, prazos e dados são fictícios. */
window.LPAgentScripts = {
  medida: [
    { from: 'user', text: 'Minha bancada tem 55 cm de profundidade. A cuba gourmet 60x45 cabe? Qual o recorte?' },
    { from: 'bot', text: 'Cabe. A Cuba Gourmet Inox 304 60x45 cm pede bancada a partir de 52 cm. Para embutir, o recorte é de 57 x 42 cm, e o gabarito vem na caixa.' },
    { from: 'user', text: 'O marmorista quer instalar por baixo da pedra.' },
    { from: 'bot', text: 'Este modelo aceita instalação por baixo. Nesse caso o recorte muda para 54 x 39 cm. Quer a ficha técnica em PDF para enviar a ele?' },
    { from: 'user', text: 'Quero.' },
    { from: 'bot', text: 'Aqui está a ficha técnica da Cuba Gourmet 60x45. Se ele tiver uma dúvida que não esteja ali, passo para a nossa equipe técnica.' }
  ],
  kit: [
    { from: 'user', text: 'Quero uma torneira dourada e uma cuba que combine, para um lavabo, até uns R$ 1.100.' },
    { from: 'bot', text: 'Uma boa combinação é a Cuba de Apoio em Vidro Fumê 42 cm, R$ 359,90 no Pix, que valoriza o dourado, com esta torneira de parede:', product: { name: 'Torneira de Parede Bica Longa Dourado Escovado', price: 'R$ 549,90 no Pix', img: 'media/p-torneira.webp' } },
    { from: 'user', text: 'Essa torneira funciona com caixa d\'água?' },
    { from: 'bot', text: 'Pela ficha técnica, funciona em baixa e alta pressão. A cuba de apoio não acompanha válvula: a Válvula Click Dourada sai por R$ 118,90. Adiciono as três?' },
    { from: 'user', text: 'Pode.' },
    { from: 'sys', text: '3 itens adicionados ao carrinho' },
    { from: 'bot', text: 'Pronto: R$ 1.028,70 no Pix, sem o frete. Me passe o CEP e eu calculo a entrega.' }
  ],
  frete: [
    { from: 'user', text: 'Qual o frete da torneira dourada para o CEP 30140-071?' },
    { from: 'bot', text: 'Para Belo Horizonte, MG: econômica por R$ 38,90, de 6 a 9 dias úteis, ou expressa por R$ 72,40, de 3 a 4 dias úteis, contados da confirmação do pagamento.' },
    { from: 'user', text: 'O encanador vem daqui a uma semana. Chega a tempo?' },
    { from: 'bot', text: 'Pagando hoje no Pix, a expressa tem previsão de chegar antes. É uma estimativa da transportadora, não uma data garantida. A econômica provavelmente não chega.' },
    { from: 'user', text: 'Vou de expressa.' },
    { from: 'bot', text: 'A torneira está no carrinho com o CEP preenchido. No checkout, é só escolher a entrega expressa.' }
  ],
  obra: [
    { from: 'user', text: 'Sou arquiteta e estou especificando um residencial. Preciso de 20 torneiras dourado escovado para banheiro.' },
    { from: 'bot', text: 'Vou encaminhar ao nosso time de arquitetura e interiores. Antes: a cuba é de apoio ou de embutir? Qual a cidade e a previsão de entrega na obra?' },
    { from: 'user', text: 'Apoio, bica alta. Curitiba, entrega em março. Talvez 20 cubas de apoio também.' },
    { from: 'bot', text: 'A indicada é a Torneira Monocomando Bica Alta Dourado Escovado. Quantidade, prazo e condição para volume ficam com o time comercial. Pode me passar nome, escritório e e-mail? Uso só para este orçamento.' },
    { from: 'user', text: 'Marina, Alves Arquitetura, marina@exemplo.com.br' },
    { from: 'sys', text: 'Pedido enviado ao time de arquitetura: 20 torneiras e possivelmente 20 cubas de apoio, Curitiba, março' },
    { from: 'bot', text: 'Pronto, Marina. Um especialista recebeu o resumo e retorna por e-mail no próximo horário comercial.' }
  ],
  pos: [
    { from: 'user', text: 'Quero saber do meu pedido.' },
    { from: 'bot', text: 'Claro. Me informe o número do pedido e o e-mail usado na compra.' },
    { from: 'user', text: '10482, joao@exemplo.com.br' },
    { from: 'bot', text: 'Pedido 10482, Torneira de Parede Bica Longa Inox: enviado. A transportadora prevê a entrega para sexta-feira.' },
    { from: 'user', text: 'Comprei o acabamento errado, queria a dourada. Dá para trocar?' },
    { from: 'bot', text: 'Dá. Pela política da loja, a troca vale por até 7 dias após o recebimento, com o produto sem uso e na embalagem original. Abro a solicitação para o pós-venda?' },
    { from: 'user', text: 'Pode abrir.' },
    { from: 'sys', text: 'Troca aberta: pedido 10482, de inox para dourado escovado' },
    { from: 'bot', text: 'Registrado. O pós-venda envia as instruções por e-mail e avisa se houver diferença de preço.' }
  ]
};
