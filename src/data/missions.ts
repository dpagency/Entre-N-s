import { MissionDef } from '../types/game';

export const MISSIONS: MissionDef[] = [
  // -------------------------------------------------------------
  // MISSÃO 1: UMA VOZ AINDA NÃO OUVIDA (Praça do Encontro)
  // -------------------------------------------------------------
  {
    id: 'missao-1',
    code: 'M-01',
    title: 'Uma voz ainda não ouvida',
    regionId: 'praca',
    missionType: 'reflexiva',
    pedagogicalGoal: 'Compreender a diferença entre pressionar por participação e construir condições reais de acolhimento e autonomia para colegas novatos.',
    situation: {
      context: 'Na sala comunitária da Cidade dos Encontros, a equipe debate a reformulação dos fluxos de atendimento aos cidadãos. Entre os presentes está Lucas, servidor recém-empossado há três semanas.',
      trigger: 'Durante toda a reunião de 45 minutos, decisões cruciais foram debatidas por colegas mais experientes, enquanto Lucas permaneceu em silêncio contínuo, apenas anotando em seu caderno.',
      knownFacts: [
        'Lucas veio de outro órgão e tem experiência prévia em triagem digital.',
        'A pauta avançou rapidamente com opiniões fortes de dois colegas antigos.',
        'A reunião está nos 10 minutos finais e a ata será concluída em breve.'
      ],
      uncertainties: [
        'Lucas está tímido, desconfortável com o ritmo da equipe, ou prefere estudar antes de opinar?',
        'Uma interpelação direta em público pode soar constrangedora ou inclusiva?'
      ],
      institutionalNote: 'Promover inclusão no serviço público exige sensibilidade comunicacional para não confundir acolhimento com pressão expositiva.'
    },
    perspectives: [
      {
        id: 'persp-1-1',
        actorName: 'Lucas',
        actorRole: 'Servidor Recém-Chegado',
        actorAvatar: '🧑‍💻',
        summary: 'Quer contribuir com suas observações, mas teme parecer presunçoso ou contradizer normas locais que ainda não domina.',
        details: '“No meu órgão anterior, tínhamos problemas idênticos neste sistema. Eu vi onde os gargalos aconteciam. Mas sou novo aqui; a equipe parece ter convicções consolidadas e não quero soar arrogante no meu primeiro mês.”'
      },
      {
        id: 'persp-1-2',
        actorName: 'Marina',
        actorRole: 'Coordenadora da Reunião',
        actorAvatar: '👩‍💼',
        summary: 'Focada em cumprir a pauta no prazo, interpreta o silêncio como falta de objeção ou necessidade de adaptação gradual.',
        details: '“Temos 15 minutos para fechar o cronograma. Se Lucas não levantou a mão, imagino que prefira primeiro acompanhar a dinâmica antes de assumir posicionamentos mais complexos.”'
      },
      {
        id: 'persp-1-3',
        actorName: 'Carlos',
        actorRole: 'Colega de Equipe Veterano',
        actorAvatar: '🧔',
        summary: 'Acredita que quem tem algo a dizer deve se manifestar de pronto, sem formalismos.',
        details: '“Aqui todo mundo fala o que pensa. Se ele não falar agora na reunião, depois que a decisão for publicada vai ficar mais difícil mudar o rumo das coisas.”'
      }
    ],
    additionalContexts: [
      {
        id: 'ctx-1-1',
        label: 'Histórico de Integração',
        unlockedByPower: 'alex',
        content: 'No plano de ambientação funcional da unidade, consta que novatos devem ter um tutor designado para conversas individuais de alinhamento nas primeiras semanas, o que ainda não ocorreu com Lucas por sobrecarga da equipe.'
      },
      {
        id: 'ctx-1-2',
        label: 'Perspectiva Externa (Ouvidoria/Sociedade)',
        unlockedByPower: 'bia',
        content: 'Relatórios recentes da Ouvidoria mostram que grande parte das queixas dos cidadãos refere-se exatamente à falta de usabilidade nos formulários que Lucas operava com maestria em sua lotação anterior.'
      }
    ],
    actions: [
      {
        id: 'act-1-a',
        title: 'Convite aberto e respeitoso na reunião',
        actionType: 'dialogo',
        description: 'Abrir espaço caloroso antes do encerramento: “Lucas, sei que você está se ambientando, mas se tiver alguma impressão inicial do seu olhar fresco, gostaríamos muito de ouvir — agora ou por mensagem depois.”',
        justification: 'Valida a presença do colega sem impor um interrogatório forçado, dando a ele o controle de quando e como opinar.',
        pedagogicalFeedback: 'O convite abre espaço para a contribuição de Lucas sem exigir que ele fale naquele momento. É importante observar se ele realmente se sente livre para escolher quando e como participar.',
        consequenceSummary: 'Lucas agradece e compartilha um ponto sutil sobre triagem digital que a equipe não havia notado, enriquecendo o plano.',
        consequenceDetails: 'A reunião termina com a equipe mais integrada. Lucas sente que sua bagagem anterior é valorizada, e os colegas percebem que o ritmo acelerado às vezes silencia contribuições valiosas.'
      },
      {
        id: 'act-1-b',
        title: 'Conversa reservada pós-reunião com canal assíncrono',
        actionType: 'acolhimento',
        description: 'Esperar o término da reunião e procurá-lo num café ou por mensagem direta, perguntando como se sentiu e convidando-o a enviar anotações por e-mail para a ata revisada.',
        justification: 'Respeita a timidez ou prudência inicial de quem ainda mapeia o território funcional e prefere comunicação estruturada.',
        pedagogicalFeedback: 'Uma conversa reservada pode oferecer mais segurança para Lucas se expressar. Convém verificar se haverá tempo e um canal efetivo para incorporar sua contribuição à decisão.',
        consequenceSummary: 'Lucas detalha por escrito um documento comparativo muito útil no dia seguinte, sem ter sido pressionado na plenária.',
        consequenceDetails: 'A coordenadora inclui as observações de Lucas na minuta final. Estabelece-se uma relação de confiança de médio prazo com o novo servidor.'
      },
      {
        id: 'act-1-c',
        title: 'Passar a palavra a ele formalmente de improviso',
        actionType: 'cautela',
        description: 'Interromper a pauta e exigir: “Lucas, você não falou nada a reunião inteira. Diga agora o que você acha do projeto todo.”',
        justification: 'Tentativa direta de exigir participação imediata para garantir que ninguém saia sem falar.',
        pedagogicalFeedback: 'Embora a intenção aparente seja incluir, a forma expositiva gera constrangimento e sensação de teste ou cobrança perante o coletivo.',
        consequenceSummary: 'Lucas fica surpreso e desconfortável, respondendo de forma lacônica e insegura apenas para se desvencilhar.',
        consequenceDetails: 'O silêncio posterior foi desconfortável. Lucas sentiu-se julgado por não ter se manifestado antes, o que retraiu ainda mais sua postura nas semanas seguintes.'
      }
    ],
    discovery: {
      key: 'escuta',
      title: 'Escuta Ativa e Inclusão Segura',
      subtitle: 'Convivência não é forçar a fala, mas abrir espaço seguro',
      description: 'A inclusão real no serviço público reconhece que nem todo mundo se expressa no mesmo ritmo ou diante de plateias dominadas por veteranos. O acolhimento inteligente oferece múltiplos canais para a circulação de saberes.',
      reflectionQuestion: 'Como criamos em nosso dia a dia espaços em que servidores novatos possam questionar sem receio de parecerem inadequados?',
      icon: 'Ear'
    },
    editorialInfo: {
      source: 'Cadernos de Boas Práticas em Convivência e Gestão de Pessoas no Setor Público (Orientação Pedagógica Proposta)',
      version: 'v1.2.0',
      reviewStatus: 'Revisão Pedagógica Concluída'
    }
  },

  // -------------------------------------------------------------
  // MISSÃO 2: DISCORDAR SEM DIMINUIR (Sala das Decisões)
  // -------------------------------------------------------------
  {
    id: 'missao-2',
    code: 'M-02',
    title: 'Discordar sem diminuir',
    regionId: 'sala',
    missionType: 'fundamentada',
    pedagogicalGoal: 'Compreender que divergências técnicas e erros operacionais não justificam ataques à honra ou desqualificação pessoal no ambiente institucional.',
    situation: {
      context: 'No grupo de mensagens de trabalho da equipe de análise de processos, o prazo para envio de um levantamento de impacto orçamentário se esgotava.',
      trigger: 'Um colega (Tiago) cometeu um equívoco na planilha de cálculo de prazos. Em vez de apontar a divergência numérica, Roberto enviou no grupo: “Impressionante como tem gente aqui que parece não saber nem fazer conta de padaria. Falta total de competência”.',
      knownFacts: [
        'A planilha de Tiago continha de fato uma fórmula desatualizada que alterava uma coluna.',
        'A mensagem com adjetivos desqualificantes foi enviada no grupo oficial de 14 servidores.',
        'Tiago visualizou a mensagem e saiu do grupo sem responder.'
      ],
      uncertainties: [
        'A equipe deve ignorar o tom agressivo sob pretexto da urgência da entrega?',
        'Como separar a correção técnica inadiável do repúdio inequívoco à ofensa pessoal?'
      ],
      institutionalNote: 'O respeito à dignidade é dever irrevogável no serviço público. O estresse ou o erro alheio jamais legitimam condutas humilhantes.'
    },
    perspectives: [
      {
        id: 'persp-2-1',
        actorName: 'Tiago',
        actorRole: 'Analista que errou a fórmula',
        actorAvatar: '🧑‍💻',
        summary: 'Reconhece que errou por cansaço, mas sentiu-se profundamente humilhado perante todos os colegas e chefias.',
        details: '“Eu passei a noite revisando dados. Errei a linha 4. Bastava me avisar que eu corrigia em três minutos. Ser chamado de incompetente na frente de todo mundo me destruiu.”'
      },
      {
        id: 'persp-2-2',
        actorName: 'Roberto',
        actorRole: 'Servidor que fez o comentário ofensivo',
        actorAvatar: '👨‍💼',
        summary: 'Justifica-se dizendo que é exigente com resultados e que a equipe não pode tolerar erros em entregas públicas.',
        details: '“Estou sob pressão da diretoria. Se aquele relatório saísse errado, a instituição passaria vergonha. Não tenho tempo para meias palavras quando a entrega está em risco.”'
      },
      {
        id: 'persp-2-3',
        actorName: 'Camila',
        actorRole: 'Colega de Equipe que testemunhou a cena',
        actorAvatar: '👩‍🏫',
        summary: 'Preocupa-se com o clima tóxico, mas teme que intervir piore o conflito ou atrase a planilha.',
        details: '“Todo mundo viu o absurdo do comentário, mas ninguém escreveu nada no grupo. O silêncio pareceu concordância com a agressão, o que me deixou muito mal.”'
      }
    ],
    additionalContexts: [
      {
        id: 'ctx-2-1',
        label: 'Desdobramentos Futuros (Poder Joana)',
        unlockedByPower: 'joana',
        content: 'Cenário 1: Se a ofensa passar em branco, o grupo normaliza agressões sob o pretexto de "pressão por metas". Cenário 2: Se a correção técnica for separada da conduta ética, a equipe restaura a planilha e restabelece a regra de respeito mútuo.'
      },
      {
        id: 'ctx-2-2',
        label: 'Diretriz da Comissão de Ética',
        unlockedByPower: 'alex',
        content: 'A jurisprudência ética consolidada estabelece que o calor do debate técnico e a urgência administrativa não afastam o dever de urbanidade, civilidade e consideração com colegas de trabalho.'
      }
    ],
    actions: [
      {
        id: 'act-2-a',
        title: 'Intervenção responsável: corrigir o dado e rechaçar a ofensa',
        actionType: 'orientacao',
        isPreferableInContext: true,
        description: 'No próprio grupo: corrigir prontamente o erro na planilha para salvar a entrega, e posicionar com firmeza que divergências devem ser tratadas tecnicamente, sem ataques pessoais. Em seguida, acolher Tiago no privado.',
        justification: 'Protege a entrega pública sem validar a humilhação coletiva, restabelecendo os limites de convivência diante de todas as testemunhas.',
        pedagogicalFeedback: 'Essa intervenção combina a correção necessária do trabalho com a proteção da dignidade de Tiago. Também abre espaço para examinar como a equipe pode prevenir novas ofensas.',
        consequenceSummary: 'A planilha é consertada em minutos; o clima é estabilizado com limites éticos claros e Tiago retorna ao projeto amparado.',
        consequenceDetails: 'A postura serena e firme impede a naturalização da grosseria. Roberto é chamado pela chefia para alinhamento de conduta, e Tiago recupera a confiança no suporte da equipe.'
      },
      {
        id: 'act-2-b',
        title: 'Focar exclusivamente na planilha e deixar o conflito para depois',
        actionType: 'cautela',
        description: 'Publicar a versão corrigida da fórmula no grupo sem comentar nada sobre o ataque pessoal de Roberto, apostando que com o tempo a poeira baixa.',
        justification: 'Priorizar a urgência técnica estrita para não gerar mais discussões no momento crítico.',
        pedagogicalFeedback: 'Embora resolva a emergência matemática, o silêncio do grupo diante da ofensa comunica cumplicidade e fragiliza os laços de segurança psicológica.',
        consequenceSummary: 'O prazo do relatório é cumprido, mas instala-se um ressentimento duradouro e medo de errar na equipe.',
        consequenceDetails: 'Nas semanas seguintes, vários servidores evitam se voluntariar para tarefas difíceis temendo serem desqualificados publicamente por Roberto.'
      },
      {
        id: 'act-2-c',
        title: 'Confrontar Roberto publicamente com a mesma agressividade',
        actionType: 'formalizacao',
        description: 'Responder no grupo: “Incompetente e arrogante é você, Roberto, que não tem postura profissional para trabalhar com ninguém”.',
        justification: 'Sentimento de indignação imediata para defender o colega ofendido com veemência.',
        pedagogicalFeedback: 'A indignação contra a ofensa é legítima, mas responder com nova desqualificação pessoal amplifica a escalada do conflito e desvirtua o canal institucional.',
        consequenceSummary: 'O grupo se converte em um bate-boca acalorado; o foco na entrega pública se perde e o relatório atrasa.',
        consequenceDetails: 'Ambos os servidores são chamados para apuração, e a situação desgasta a unidade inteira sem resolver a fórmula nem educar para a convivência.'
      }
    ],
    tfChallenge: {
      id: 'tf-2',
      statement: 'No serviço público, quando um colega comete um erro técnico relevante sob prazo crítico, é justificável usar expressões duras e desqualificantes para demonstrar a gravidade da situação à equipe.',
      isTrue: false,
      explanation: 'FALSO. A urbanidade e o respeito à pessoa são deveres absolutos do servidor público. Erros técnicos devem ser apontados com precisão e clareza objetiva, sem qualquer ataque à dignidade pessoal.',
      sourceNote: 'Orientação Pedagógica Proposta / Código de Conduta e Ética Profissional no Serviço Público.'
    },
    discovery: {
      key: 'respeito',
      title: 'Respeito e Urbanidade em Momentos de Tensão',
      subtitle: 'O erro técnico se corrige com precisão; a dignidade nunca se negocia',
      description: 'A firmeza profissional reside na capacidade de exigir rigor técnico sem rebaixar a dignidade do outro. Nenhuma meta pública é tão urgente que justifique a humilhação de quem trabalha para alcançá-la.',
      reflectionQuestion: 'Como diferenciamos em nossas conversas diárias a crítica firme ao processo de um julgamento depreciativo sobre a pessoa?',
      icon: 'ShieldCheck'
    },
    editorialInfo: {
      source: 'Diretrizes de Urbanidade e Convivência Funcional (Orientação Pedagógica Proposta)',
      version: 'v1.2.0',
      reviewStatus: 'Revisão Pedagógica Concluída'
    }
  },

  // -------------------------------------------------------------
  // MISSÃO 3: O ERRO NA ENTREGA (Oficina Coletiva)
  // -------------------------------------------------------------
  {
    id: 'missao-3',
    code: 'M-03',
    title: 'O erro na entrega',
    regionId: 'oficina',
    missionType: 'fundamentada',
    pedagogicalGoal: 'Compreender que o dever de transparência e correção tempestiva no serviço público supera o receio pessoal de exposição ou o ímpeto de ocultar falhas.',
    situation: {
      context: 'A equipe da Oficina Coletiva acabou de consolidar o inventário anual de patrimônio e equipamentos tecnológicos distribuídos nas unidades de ensino da região.',
      trigger: 'Faltando 40 minutos para o envio oficial ao órgão central de controle, Helena percebe que uma fórmula somou em duplicidade 120 computadores que na verdade já haviam sido desativados.',
      knownFacts: [
        'A divergência altera o valor total do patrimônio ativo em cerca de R$ 360.000.',
        'Se o relatório for reaberto agora, a equipe provavelmente perderá a meta do prazo das 17h.',
        'Um colega sugere: “Vamos enviar assim mesmo para não perder o prazo. No relatório do mês que vem a gente faz um ajuste contábil discreto e ninguém percebe”.'
      ],
      uncertainties: [
        'Qual o impacto institucional real de atrasar 2 horas para enviar dados exatos versus enviar dados inverídicos no prazo?',
        'Como proteger Helena de retaliações enquanto se preserva a verdade dos registros públicos?'
      ],
      institutionalNote: 'A exatidão dos registros públicos é basilar para a fé pública e o controle social. A ocultação deliberada de erro conhecido transgride a probidade administrativa.'
    },
    perspectives: [
      {
        id: 'persp-3-1',
        actorName: 'Helena',
        actorRole: 'Servidora que detectou o erro',
        actorAvatar: '👩‍🔧',
        summary: 'Está angustiada entre o dever de falar a verdade e o medo de ser culpabilizada pelo atraso coletivo.',
        details: '“Fui eu quem montou essa tabela. Se eu disser que errei agora, vão dizer que eu prejudiquei a nota de desempenho do setor. Mas mandar sabendo que o número é falso me tira o sono.”'
      },
      {
        id: 'persp-3-2',
        actorName: 'Marcos',
        actorRole: 'Líder Técnico de Indicadores',
        actorAvatar: '👨‍💼',
        summary: 'Quer bater a meta do sistema a todo custo, apostando que retificações posteriores passam despercebidas.',
        details: '“O sistema fecha às 17h em ponto. Se não enviarmos, o setor perde o bônus de pontualidade. No próximo trimestre nós lançamos como baixa de bens e fica tudo regularizado.”'
      },
      {
        id: 'persp-3-3',
        actorName: 'Dra. Alice',
        actorRole: 'Auditora Interna Institucional',
        actorAvatar: '👩‍⚖️',
        summary: 'Explica que erros técnicos comunicados tempestivamente são corrigíveis, mas envio de dados sabidamente falsos gera apuração disciplinar grave.',
        details: '“Errar uma fórmula num documento complexo é falha operacional corrigível. Mas enviar conscientemente uma informação inverídica é falsear a fé pública. O atraso justificado é sempre infinitamente preferível.”'
      }
    ],
    additionalContexts: [
      {
        id: 'ctx-3-1',
        label: 'Regramento do Sistema Central',
        unlockedByPower: 'alex',
        content: 'O manual do sistema prevê uma janela de "Retificação com Justificativa Operacional" com protocolo tempestivo, que afasta qualquer penalidade quando comunicado pelo gestor antes da auditoria externa.'
      },
      {
        id: 'ctx-3-2',
        label: 'Visão de Consequências (Joana)',
        unlockedByPower: 'joana',
        content: 'Enviar com o erro criará discrepância patrimonial quando as escolas solicitarem manutenção para máquinas inexistentes, disparando procedimento formal de apuração contra todos que assinaram.'
      }
    ],
    actions: [
      {
        id: 'act-3-a',
        title: 'Correção imediata com justificativa formal de retificação',
        actionType: 'orientacao',
        isPreferableInContext: true,
        description: 'Informar imediatamente a chefia e a área técnica sobre a inconsistência identificada, suspender o envio dos dados errados, aplicar o protocolo de retificação justificada e apoiar Helena na conferência dos números.',
        justification: 'Prioriza a veracidade da informação pública, evita que servidores assinem relatórios com dados falsificados e demonstra responsabilidade institucional.',
        pedagogicalFeedback: 'Comunicar o erro prontamente permite corrigir seus efeitos e prestar contas. Vale refletir sobre como agir com transparência sem expor desnecessariamente pessoas envolvidas.',
        consequenceSummary: 'O envio é corrigido com duas horas de atraso mediante nota técnica justificativa, preservando a fidelidade patrimonial e a segurança da equipe.',
        consequenceDetails: 'A auditoria externa elogiou a prontidão na retificação. Helena sentiu-se amparada pelo grupo e uma nova rotina de conferência em pares foi implementada na Oficina.'
      },
      {
        id: 'act-3-b',
        title: 'Enviar no prazo e tentar corrigir sem registrar no futuro',
        actionType: 'cautela',
        description: 'Seguir a sugestão de Marcos: submeter o documento com o valor incorreto às 16h59 e tentar maquiar os números em relatórios futuros para não prejudicar as metas.',
        justification: 'Evitar o desconforto de perder o prazo no sistema e proteger temporariamente a nota do setor.',
        pedagogicalFeedback: 'Ocultar deliberadamente um erro em documento público compromete a integridade da informação e pode gerar responsabilização. A pressão por resultados não elimina o dever de comunicar e corrigir falhas.',
        consequenceSummary: 'Três meses depois, o cruzamento automático de notas fiscais apontou a divergência de 120 máquinas inexistentes.',
        consequenceDetails: 'A Corregedoria abriu sindicância investigatória para apurar se houve desvio ou falsidade ideológica. Todos os que assinaram foram chamados a depor com grande desgaste pessoal e institucional.'
      },
      {
        id: 'act-3-c',
        title: 'Cobrar de Helena que ela assuma e resolva sozinha o problema',
        actionType: 'dialogo',
        description: 'Dizer que a falha foi dela e que se ela não conseguir consertar tudo em 35 minutos antes das 17h, o setor terá que enviá-lo como está sob responsabilidade exclusiva dela.',
        justification: 'Transferir a responsabilidade para quem cometeu o erro operacional.',
        pedagogicalFeedback: 'Transferir toda a culpa a uma pessoa não resolve as falhas de revisão do trabalho coletivo. Esse caminho pode aumentar o receio de comunicar erros e dificultar melhorias nos procedimentos.',
        consequenceSummary: 'Helena tenta consertar sob pânico, comete novos erros na correria e o documento é enviado com múltiplas inconsistências.',
        consequenceDetails: 'O estresse adoece a servidora e o setor perde a credibilidade perante os órgãos de controle devido à falta de cooperação mútua.'
      }
    ],
    discovery: {
      key: 'responsabilidade',
      title: 'Responsabilidade e Probidade Pública',
      subtitle: 'A coragem de retificar vale mais do que a ilusão da perfeição apressada',
      description: 'O compromisso com o interesse público não tolera a maquiagem de dados em nome de metas estatísticas. Erros operacionais corrigidos com transparência fortalecem a confiança cidadã; erros ocultados corroem as instituições.',
      reflectionQuestion: 'Como nossa unidade reage quando alguém descobre um erro a minutos de um prazo: com punição imediata ou com esforço coletivo de correção transparente?',
      icon: 'CheckCircle2'
    },
    editorialInfo: {
      source: 'Princípios Constitucionais da Administração Pública e Controle Patrimonial (Orientação Pedagógica Proposta)',
      version: 'v1.2.0',
      reviewStatus: 'Revisão Pedagógica Concluída'
    }
  },

  // -------------------------------------------------------------
  // MISSÃO 4: O ATENDIMENTO QUE ESTÁ TERMINANDO (Portal do Atendimento)
  // -------------------------------------------------------------
  {
    id: 'missao-4',
    code: 'M-04',
    title: 'O atendimento que está terminando',
    regionId: 'portal',
    missionType: 'reflexiva',
    pedagogicalGoal: 'Refletir sobre o equilíbrio delicado entre humanização do acolhimento ao cidadão vulnerável, equidade de atendimento e limites legítimos da jornada de trabalho do servidor.',
    situation: {
      context: 'No balcão presencial do Portal do Atendimento da Cidade dos Encontros, o horário de encerramento do expediente é às 17h.',
      trigger: 'Às 16h53, chega Dona Conceição, senhora idosa que pegou dois ônibus da zona rural, trazendo uma pasta com papéis para tentar solicitar um benefício assistencial essencial.',
      knownFacts: [
        'A lista de exigências é longa e complexa; uma análise completa levaria pelo menos 30 a 40 minutos.',
        'O sistema central fecha impreterivelmente às 17h15 para processamento diário em lote.',
        'A servidora atendente tem compromisso familiar inadiável (pegar filho na creche até às 17h45).'
      ],
      uncertainties: [
        'Como garantir que a cidadã não saia desamparada sem impor à servidora a extrapolação desmedida de sua jornada ou atribuições?',
        'Qual o papel da orientação clara e do agendamento prioritário na preservação da dignidade mútua?'
      ],
      institutionalNote: 'O serviço público deve acolher com empatia as vulnerabilidades sociais, sem exigir sacrifícios pessoais insustentáveis dos trabalhadores ou desrespeito às regras do órgão.'
    },
    perspectives: [
      {
        id: 'persp-4-1',
        actorName: 'Dona Conceição',
        actorRole: 'Cidadã usuária do serviço',
        actorAvatar: '👵',
        summary: 'Está cansada, ansiosa e teme perder a viagem e o benefício de subsistência.',
        details: '“Saí de casa às 13h. Se eu for embora sem saber se meus papéis estão certos, não tenho como pagar outra passagem amanhã. Só preciso de uma luz para saber se falta alguma coisa.”'
      },
      {
        id: 'persp-4-2',
        actorName: 'Renata',
        actorRole: 'Servidora no balcão de atendimento',
        actorAvatar: '👩‍💼',
        summary: 'Deseja ajudar com o coração, mas sabe que não pode ultrapassar o horário limite da creche nem processar todo o protocolo em 7 minutos.',
        details: '“Tenho até às 17h para fechar meu caixa e preciso atravessar a cidade para buscar meu filho pequeno. Se eu disser um não frio, me sinto desumana; se eu prometer tudo, vou falhar com ambos.”'
      },
      {
        id: 'persp-4-3',
        actorName: 'Supervisor Mauro',
        actorRole: 'Chefe de Unidade de Atendimento',
        actorAvatar: '👨‍💼',
        summary: 'Lembra que existem canais de triagem rápida e encaixe prioritário para o dia seguinte.',
        details: '“Não podemos registrar o benefício completo agora porque o sistema vai travar no meio. Mas podemos fazer a conferência prévia dos três documentos básicos e emitir senha preferencial para abertura logo pela manhã.”'
      }
    ],
    additionalContexts: [
      {
        id: 'ctx-4-1',
        label: 'Recursos Disponíveis na Unidade',
        unlockedByPower: 'alex',
        content: 'Existe um Guia Ilustrado em Linguagem Cidadã simples e uma lista impressa de checagem documental criada pela Ouvidoria para cidadãos levarem para casa.'
      },
      {
        id: 'ctx-4-2',
        label: 'Perspectiva da Assistência Social (Poder Bia)',
        unlockedByPower: 'bia',
        content: 'O Centro de Referência de Assistência Social (CRAS) do bairro de Dona Conceição pode receber o pedido diretamente por lá sem necessidade de deslocamento até a sede central.'
      }
    ],
    actions: [
      {
        id: 'act-4-a',
        title: 'Triagem preliminar rápida, lista clara de documentos e agendamento preferencial',
        actionType: 'orientacao',
        description: 'Dedicar os 7 minutos finais para olhar com carinho os documentos principais, circular com caneta clara o que está correto e o que falta na lista impressa, e agendar horário prioritário garantido no dia seguinte (ou informar o posto perto da casa dela).',
        justification: 'Entrega valor real à cidadã, poupa-a de viagens inúteis e respeita com clareza o limite de horário da servidora.',
        pedagogicalFeedback: 'Acolher a pessoa e explicar os limites do atendimento ajuda a conciliar respeito e responsabilidade funcional. A equipe também pode avaliar quais encaminhamentos são realmente viáveis.',
        consequenceSummary: 'Dona Conceição sai aliviada sabendo exatamente o que providenciar; Renata consegue buscar seu filho no horário.',
        consequenceDetails: 'Dona Conceição retornou dois dias depois diretamente com os documentos certos e foi atendida em 10 minutos. O balcão funcionou com dignidade para ambas as partes.'
      },
      {
        id: 'act-4-b',
        title: 'Fechar a janela bruscamente: “O horário encerrou, volte amanhã”',
        actionType: 'cautela',
        description: 'Apontar para o relógio na parede às 16h55 e recusar qualquer conversa, orientando-a a retornar na fila normal no dia seguinte.',
        justification: 'Cumprimento estrito e impessoal da regra horária sem flexibilidade comunicacional.',
        pedagogicalFeedback: 'Cumprir o horário é importante, mas encerrar o contato sem orientação pode deixar o cidadão sem saber como proceder. É possível avaliar formas de acolhimento compatíveis com os limites do serviço.',
        consequenceSummary: 'Dona Conceição chora de cansaço e frustração; testemunhas no saguão ficam revoltadas com a frieza do setor.',
        consequenceDetails: 'Uma reclamação foi protocolada na Ouvidoria por descortesia e falta de orientação à pessoa idosa, desgastando a imagem do Portal do Atendimento.'
      },
      {
        id: 'act-4-c',
        title: 'Iniciar o processo completo prometendo concluir tudo hoje',
        actionType: 'acolhimento',
        description: 'Tentar cadastrar todos os formulários correndo, mesmo sabendo que o sistema cairá às 17h15 e que Renata perderá a hora da creche.',
        justification: 'Vontade de resolver todo o problema da cidadã a qualquer custo pessoal.',
        pedagogicalFeedback: 'A intenção de ajudar não torna viável prometer um atendimento fora das condições disponíveis. Convém considerar os limites do sistema, os riscos de erro e a sustentabilidade do trabalho.',
        consequenceSummary: 'Às 17h15 o sistema trava no meio do cadastro sem salvar nada; ambas saem frustradas e desgastadas.',
        consequenceDetails: 'Renata precisou pagar multa na creche e Dona Conceição terá que refazer todo o processo porque o protocolo não foi gerado.'
      }
    ],
    discovery: {
      key: 'orientacao',
      title: 'Orientação Clara e Humanização com Limites',
      subtitle: 'Cuidar do cidadão não exige o esgotamento do servidor',
      description: 'A excelência no atendimento ao público combina generosidade de orientação e clareza sobre limites operacionais. Oferecer caminhos viáveis e informação transparente é a forma mais duradoura de respeito à cidadania.',
      reflectionQuestion: 'Como nossos serviços públicos podem estruturar fluxos de triagem e linguagem simples para que ninguém saia sem uma resposta compreensível?',
      icon: 'HelpCircle'
    },
    editorialInfo: {
      source: 'Carta de Serviços ao Usuário e Diretrizes de Atendimento Humanizado (Orientação Pedagógica Proposta)',
      version: 'v1.2.0',
      reviewStatus: 'Revisão Pedagógica Concluída'
    }
  },

  // -------------------------------------------------------------
  // MISSÃO 5: É BRINCADEIRA PARA QUEM (Praça do Encontro)
  // -------------------------------------------------------------
  {
    id: 'missao-5',
    code: 'M-05',
    title: 'É brincadeira para quem',
    regionId: 'praca',
    missionType: 'fundamentada',
    pedagogicalGoal: 'Reconhecer que preconceito, piadas sobre origem e discriminação não constituem liberdade de expressão nem simples desentendimento, exigindo interrupção segura, acolhimento e atuação institucional.',
    situation: {
      context: 'Na copa da Praça do Encontro, servidores de diferentes equipes costumam fazer o intervalo da tarde.',
      trigger: 'Um grupo ri alto enquanto um servidor veterano faz imitações estereotipadas do sotaque e costumes de Sandra, servidora concursada vinda do interior do Nordeste, insinuando "preguiça cultural". Sandra ouve a cena, baixa a cabeça constrangida e sai do recinto.',
      knownFacts: [
        'Não é a primeira vez que piadas pejorativas sobre a origem regional de Sandra são feitas naquele espaço.',
        'Ao perceber o desconforto, um dos servidores disse: “Ah, é só brincadeira para descontrair, não precisa ser tão sensível”.',
        'Sandra evitou a copa nos dias seguintes e tem se isolado no trabalho.'
      ],
      uncertainties: [
        'Como interromper a conduta discriminatória sem expor Sandra a novas retaliações?',
        'Quais canais institucionais devem ser acionados para apoio e providências cabíveis?'
      ],
      institutionalNote: 'A discriminação por origem, raça, gênero ou qualquer condição viola frontalmente a dignidade humana e o estatuto dos servidores públicos, constituindo falta disciplinar e ilícito.'
    },
    perspectives: [
      {
        id: 'persp-5-1',
        actorName: 'Sandra',
        actorRole: 'Servidora vítima dos comentários',
        actorAvatar: '👩‍🦱',
        summary: 'Sente-se humilhada, diminuída em sua competência e desprotegida no ambiente de trabalho.',
        details: '“Passei em concurso público disputadíssimo por mérito. Mas parece que para alguns colegas, meu sotaque e minha terra são motivo de chacota. Fico com medo de reclamar e me chamarem de encrenqueira.”'
      },
      {
        id: 'persp-5-2',
        actorName: 'Valter',
        actorRole: 'Servidor autor das imitações',
        actorAvatar: '👨‍🦰',
        summary: 'Minimiza a gravidade alegando que "sempre fez piada com todo mundo" e que "o ambiente está ficando chato".',
        details: '“Todo mundo brinca aqui. Eu também brinco com gente de São Paulo, do Sul. Não tinha maldade nenhuma, era só piada entre colegas.”'
      },
      {
        id: 'persp-5-3',
        actorName: 'Lia',
        actorRole: 'Colega de Equipe que presenciou a cena',
        actorAvatar: '👩‍⚕️',
        summary: 'Indignada com a atitude preconceituosa, entende que rir ou calar é ser cúmplice da violência psicológica.',
        details: '“Chamar discriminação de brincadeira é uma tática velha para silenciar a vítima. Se a gente não marcar posição, o ambiente se torna hostil e insuportável.”'
      }
    ],
    additionalContexts: [
      {
        id: 'ctx-5-1',
        label: 'Canais de Acolhimento e Proteção',
        unlockedByPower: 'alex',
        content: 'A instituição dispõe de uma Comissão de Equidade e Diversidade e canal seguro de Acolhimento Psicossocial na Gestão de Pessoas, onde Sandra pode relatar o fato com garantia de sigilo e não retaliação.'
      },
      {
        id: 'ctx-5-2',
        label: 'Voz da Ouvidoria Institucional (Poder Bia)',
        unlockedByPower: 'bia',
        content: 'O canal de Ouvidoria possui protocolo específico para manifestações sobre assédio e discriminação, permitindo a instauração de apuração disciplinar com proteção à identidade de quem denuncia.'
      }
    ],
    actions: [
      {
        id: 'act-5-a',
        title: 'Interrupção firme da fala preconceituosa, acolhimento a Sandra e orientação sobre canais',
        actionType: 'acolhimento',
        isPreferableInContext: true,
        description: 'No momento: manifestar claramente que estereótipos regionais não são brincadeira e desrespeitam colegas. Em seguida: acolher Sandra com escuta segura e informá-la sobre os canais de Acolhimento e Ouvidoria/Comissão de Ética, respeitando sua decisão de representação formal.',
        justification: 'Não terceiriza o combate ao preconceito para a vítima, interrompe a cumplicidade coletiva e apoia Sandra com recursos institucionais reais.',
        pedagogicalFeedback: 'Interromper a discriminação e acolher a pessoa atingida protege sua dignidade. A situação também exige avaliar os encaminhamentos institucionais adequados, sem tratar a ofensa como mera divergência de opinião.',
        consequenceSummary: 'O comportamento discriminatório é barrado; Sandra sente que não está sozinha e a instituição toma providências educativas e correcionais.',
        consequenceDetails: 'A intervenção serviu de ponto de virada na unidade. A Gestão de Pessoas organizou oficina sobre respeito à diversidade e Valter foi formalmente advertido por sua conduta.'
      },
      {
        id: 'act-5-b',
        title: 'Exigir que Sandra enfrente Valter sozinha numa "reunião de conciliação"',
        actionType: 'dialogo',
        description: 'Organizar um encontro cara a cara forçado entre Sandra e Valter para que "eles se acertem como adultos", tratando a situação como mero desentendimento interpessoal.',
        justification: 'Tentativa de resolver conflitos rapidamente por conversa direta.',
        pedagogicalFeedback: 'Obrigar a pessoa atingida a confrontar quem a ofendeu pode ampliar seu sofrimento e desconsiderar a assimetria da situação. A resposta institucional deve priorizar proteção, escuta e encaminhamentos apropriados.',
        consequenceSummary: 'Sandra é colocada em situação de extremo constrangimento e pressão para desculpar o colega sem qualquer retratação genuína.',
        consequenceDetails: 'Sandra se sente desamparada pela gestão e pede transferência de setor por não suportar o clima forçado.'
      },
      {
        id: 'act-5-c',
        title: 'Aconselhar Sandra a não ligar para "não criar clima ruim"',
        actionType: 'cautela',
        description: 'Dizer a Sandra no privado: “O Valter é sem noção mesmo, não liga não, releva para manter a paz da equipe e não queimar pontes”.',
        justification: 'Preservar a harmonia aparente do setor e evitar desdobramentos administrativos.',
        pedagogicalFeedback: 'Ignorar a discriminação para preservar uma aparência de harmonia deixa a pessoa atingida desprotegida e favorece a repetição da conduta. O dever de respeito exige uma resposta efetiva.',
        consequenceSummary: 'Valter continua fazendo piadas com outros servidores; o ambiente se degrada gradativamente.',
        consequenceDetails: 'Outros colegas também passam a ser alvo de comentários pejorativos, demonstrando que a omissão coletiva encoraja o assédio moral.'
      }
    ],
    tfChallenge: {
      id: 'tf-5',
      statement: 'Comentários pejorativos sobre a origem regional, sotaque ou cultura de colegas no ambiente de trabalho podem ser tratados como mera liberdade de expressão se o autor declarar que não tinha intenção de ofender.',
      isTrue: false,
      explanation: 'FALSO. A discriminação e o preconceito são expressamente vedados no serviço público e na legislação brasileira. A ausência alegada de intenção não elide a ilicitude do ato nem o dano moral causado à dignidade da pessoa e ao ambiente de trabalho.',
      sourceNote: 'Orientação Pedagógica Proposta / Lei nº 7.716/1989 e Código de Ética Profissional.'
    },
    discovery: {
      key: 'respeito',
      title: 'Dignidade, Diversidade e Não Tolerância ao Preconceito',
      subtitle: 'Brincadeira gera alegria coletiva; o que humilha é violência moral',
      description: 'O serviço público é o reflexo da sociedade brasileira em toda a sua riqueza e pluralidade. Proteger a dignidade de cada servidor e cidadão contra estereótipos preconceituosos é dever funcional de todos os guardiões da convivência.',
      reflectionQuestion: 'Como agimos no dia a dia quando presenciamos comentários jocosos que diminuem a dignidade de alguém: rimos por hábito ou nos posicionamos com firmeza?',
      icon: 'HeartHandshake'
    },
    editorialInfo: {
      source: 'Diretrizes Nacionais de Promoção da Equidade e Prevenção ao Assédio Moral (Orientação Pedagógica Proposta)',
      version: 'v1.2.0',
      reviewStatus: 'Revisão Pedagógica Concluída'
    }
  },

  // -------------------------------------------------------------
  // MISSÃO 6: LEALDADE A QUEM (Oficina Coletiva / Sala das Decisões)
  // -------------------------------------------------------------
  {
    id: 'missao-6',
    code: 'M-06',
    title: 'Lealdade a quem',
    regionId: 'oficina',
    missionType: 'fundamentada',
    pedagogicalGoal: 'Diferenciar lealdade pessoal ou corporativa de lealdade ao interesse público, atuando com prudência e canais institucionais sem confundir suspeita com condenação sumária nem acobertar irregularidades.',
    situation: {
      context: 'Na fiscalização de um contrato de prestação de serviços de transporte e manutenção da Cidade dos Encontros, a equipe está fechando a medição mensal.',
      trigger: 'Um colega próximo e querido na equipe pede que você assine a atestação de serviços sem registrar que metade dos veículos terceirizados não prestou o serviço contratado naquele mês: “Se você apontar isso no laudo, a chefia vai cancelar nosso contrato todo, a empresa vai demitir terceirizados e nossa equipe vai ficar mal vista. Faz vista grossa dessa vez pela nossa amizade”.',
      knownFacts: [
        'A ausência dos veículos acarretou prejuízo de atendimento aos cidadãos nos bairros periféricos.',
        'A atestação de serviço não executado configura atesto ideologicamente falso de despesa pública.',
        'O colega alega que a empresa prometeu repor os veículos no mês seguinte em acordo informal de bastidor.'
      ],
      uncertainties: [
        'Como cumprir o dever de fiscalização sem agir como justiceiro nem pré-julgar má-fé do colega?',
        'Qual o canal correto para formalizar a inconformidade com devido processo legal?'
      ],
      institutionalNote: 'A lealdade do servidor público é devida à Constituição, às leis e à sociedade, jamais a conveniências pessoais, amizades ou acordos informais que lesem o erário.'
    },
    perspectives: [
      {
        id: 'persp-6-1',
        actorName: 'Daniel',
        actorRole: 'Colega que solicita a omissão',
        actorAvatar: '👨‍🔧',
        summary: 'Teme o desgaste burocrático e penalidades para a equipe, justificando o atesto como "flexibilidade prática".',
        details: '“Nós trabalhamos juntos há cinco anos. A empresa teve um problema com motoristas, mas vão repor tudo. Se a gente formalizar o corte, o processo vai travar na auditoria por seis meses.”'
      },
      {
        id: 'persp-6-2',
        actorName: 'Dra. Beatriz',
        actorRole: 'Procuradora Institucional',
        actorAvatar: '👩‍💼',
        summary: 'Explica que atestar despesa não realizada é conduta que atenta contra os princípios da administração e pode configurar improbidade.',
        details: '“Fiscal de contrato não tem poder discricionário para perdoar descumprimento sem desconto na fatura. Proteger a amizade às custas do recurso público é inverter a própria razão de existir do servidor.”'
      },
      {
        id: 'persp-6-3',
        actorName: 'Cidadão José',
        actorRole: 'Usuário do Transporte Comunitário',
        actorAvatar: '👨‍🌾',
        summary: 'Esperou por duas horas sob chuva no ponto porque o micro-ônibus contratado não passou.',
        details: '“Disseram que o contrato pagava transporte de hora em hora. Fiquei esperando sem ter como levar meu remédio para casa. Quem paga a conta no final é o povo.”'
      }
    ],
    additionalContexts: [
      {
        id: 'ctx-6-1',
        label: 'Mecanismo Formal de Glosa Contratual',
        unlockedByPower: 'alex',
        content: 'O procedimento padrão da instituição permite lavrar o Relatório de Fiscalização com "glosa técnica proporcional", descontando exatamente os dias em que os carros faltaram, sem necessidade de cancelamento traumático do contrato.'
      },
      {
        id: 'ctx-6-2',
        label: 'Visão de Futuro da Corregedoria (Joana)',
        unlockedByPower: 'joana',
        content: 'Se o laudo for assinado com atesto falso e o Tribunal de Contas fizer conferência por GPS dos carros, todos os fiscais signatários responderão a processo administrativo disciplinar por infração grave.'
      }
    ],
    actions: [
      {
        id: 'act-6-a',
        title: 'Registrar a execução real com glosa formal dos serviços não prestados',
        actionType: 'formalizacao',
        isPreferableInContext: true,
        description: 'Explicar com respeito ao colega que a atestação deve refletir estritamente os fatos comprovados; emitir o relatório técnico apontando a ausência dos veículos com desconto correspondente no faturamento e notificar a contratada para regularização imediata.',
        justification: 'Cumpre com exatidão a função de fiscalização, protege os recursos públicos, garante o direito de defesa da empresa e resguarda juridicamente os servidores.',
        pedagogicalFeedback: 'Recusar a confirmação de serviços não prestados preserva a veracidade dos registros e o interesse público. A relação pessoal não afasta a responsabilidade de agir com base nos fatos e nos deveres funcionais.',
        consequenceSummary: 'O erário é preservado com desconto de R$ 45.000 na fatura; a empresa repõe a frota completa sob pena de multa contratual.',
        consequenceDetails: 'Daniel compreende que assinar o documento falso teria colocado a carreira de ambos em risco. A linha comunitária foi reestabelecida para os cidadãos com fiscalização exemplar.'
      },
      {
        id: 'act-6-b',
        title: 'Assinar o atesto falso para preservar a relação de camaradagem com o colega',
        actionType: 'cautela',
        description: 'Ceder ao pedido de Daniel, certificar que 100% dos veículos rodaram normalmente e torcer para que a empresa cumpra a promessa informal de reposição futura.',
        justification: 'Evitar o confronto com o colega amigo e manter o clima pacífico na equipe.',
        pedagogicalFeedback: 'Atestar deliberadamente serviços não prestados falsifica o registro administrativo e pode gerar responsabilização. A confiança entre colegas não justifica comprometer o patrimônio público.',
        consequenceSummary: 'A empresa não repôs os veículos no mês seguinte e a denúncia de usuários no Ministério Público deflagrou operação de auditoria.',
        consequenceDetails: 'Os dois servidores foram afastados preventivamente da comissão de fiscalização e respondem a processo correcional por prevaricação e atesto ideologicamente falso.'
      },
      {
        id: 'act-6-c',
        title: 'Fazer denúncia pública anônima nas redes sociais acusando o colega de corrupção',
        actionType: 'orientacao',
        description: 'Não conversar com Daniel, tirar fotos dos documentos e vazar em páginas públicas da internet afirmando que o setor inteiro é corrupto.',
        justification: 'Ímpeto justiceiro de expor a conduta sem passar pelos canais institucionais.',
        pedagogicalFeedback: 'Expor acusações e informações funcionais em redes sociais, sem os cuidados devidos, pode violar sigilos e prejudicar a apuração. É importante distinguir a comunicação legítima de irregularidades, inclusive anônima pelos canais apropriados, da divulgação pública precipitada.',
        consequenceSummary: 'A postagem gera escândalo sensacionalista, distorce os fatos reais e prejudica servidores inocentes.',
        consequenceDetails: 'A apuração foi contaminada por vazamento indevido, e quem vazou responde a inquérito por quebra de sigilo funcional sem ter solucionado o problema da frota.'
      }
    ],
    discovery: {
      key: 'responsabilidade',
      title: 'Integridade Pública e Lealdade Republicana',
      subtitle: 'A verdadeira lealdade serve ao bem comum, não ao compadrio',
      description: 'A integridade no serviço público reside em compreender que recursos, prazos e contratos pertencem ao povo brasileiro. Amizades e laços de equipe são valiosos, mas jamais justificam a renúncia à verdade e à legalidade.',
      reflectionQuestion: 'Como diferenciamos em nossa prática profissional a camaradagem saudável do compadrio que compromete o interesse público?',
      icon: 'Scale'
    },
    editorialInfo: {
      source: 'Código de Conduta da Alta Administração e Manual de Fiscalização de Contratos (Orientação Pedagógica Proposta)',
      version: 'v1.2.0',
      reviewStatus: 'Revisão Pedagógica Concluída'
    }
  }
];

export const MISSION_MAP = new Map(MISSIONS.map(m => [m.id, m]));
