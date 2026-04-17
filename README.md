# BarberAlgo

> Alunos: Wanderson Soares, Lucas Costa, Hellen Neves, Gabriel André
> 

<aside>
📁

Documento de requisitos e diagramas do sistema de agendamento para barbearia

Github: https://github.com/Gabriel-olimpio/barbearia-pds

</aside>

## Descrição

O BarberAlgo é um sistema desenvolvido para facilitar o gerenciamento de agendamentos em barbearias, permitindo que clientes marquem horários, consultem serviços disponíveis e acompanhem seus agendamentos, enquanto os barbeiros e administradores podem organizar suas agendas, serviços e horários de atendimento.

---

## Requisitos funcionais

**RF01 - Cadastro de cliente**

O sistema deve permitir que o cliente se cadastre informando, no mínimo, nome, telefone, email e senha.

**RF02 - Autenticação de usuário**

O sistema deve permitir que clientes, barbeiros e administradores realizem o login utilizando email e senha.

**RF03 - Recuperação de senha**

O sistema deve permitir que o usuário recupere sua senha por meio do email cadastrado.

**RF04 - Cadastro de barbeiros**

O sistema deve permitir que o administrador cadastre barbeiros, informando nome, especialidade, telefone e horários para atendimento.

**RF05 - Cadastro de serviços**

O sistema deve permitir que o administrador cadastre serviços disponíveis, com preços e duração do serviço.

**RF06 -  Consulta de serviços**

O sistema deve permitir que o cliente visualize a lista de serviços disponíveis, com preços e duração de cada um

**RF07 - Consulta de horários disponíveis**

O sistema deve permitir que o cliente consulte os horários disponíveis de cada barbeiro em uma data específica.

**RF08 - Realização agendamento**

O sistema deve permitir que o cliente realize um agendamento, selecionando serviço, barbeiro, data e horário disponível.

**RF09 - Confirmação de agendamento**

O sistema deve exibir uma confirmação ao cliente após a realização do agendamento.

**RF10 - Cancelamento de agendamento**

O sistema deve permitir que o cliente cancele um agendamento realizado com antecedência definida pela barbearia. 

**RF11 - Visualização de agendamento**

O sistema deve permitir que o cliente visualize seus agendamento passados e futuros.

**RF12 - Gerenciamento de usuários**

O sistema deve permitir que o administrador edite ou remova cadastro de clientes e barbeiros.

**RF13 - Visualização de dashboard**

O sistema deve permitir que o administrador visualize, em um dashboard, métricas de agendamento, por período, barbeiro e serviço. Como também, receita gerada pela barbearia.

---

## Requisitos não funcionais

**RNF01 – Usabilidade**

O sistema deve possuir interface simples, intuitiva e de fácil utilização, permitindo que usuários realizem agendamentos sem necessidade de treinamento prévio.

**RNF02 – Desempenho**

O sistema deve responder às solicitações do usuário em até 5 segundos em condições normais de uso.

**RNF03 – Disponibilidade**

O sistema deve estar disponível para acesso 24 horas por dia, 7 dias por semana, exceto em períodos programados de manutenção.

**RNF04 – Segurança de acesso**

O sistema deve exigir autenticação por login e senha para acesso às funcionalidades restritas.

**RNF05 – Proteção de dados**

O sistema deve armazenar os dados dos usuários de forma segura, protegendo informações pessoais e credenciais, de acordo com a LGPD.

**RNF06 – Controle de permissões**

O sistema deve restringir funcionalidades de acordo com o perfil do usuário, diferenciando cliente, barbeiro e administrador.

**RNF07 – Compatibilidade**

O sistema deve funcionar corretamente em navegadores modernos e em dispositivos móveis e computadores.

**RNF08 – Confiabilidade**

O sistema deve evitar agendamentos duplicados para o mesmo barbeiro, data e horário.

**RNF09 – Manutenibilidade**

O sistema deve ser desenvolvido de forma modular, facilitando correções, atualizações e adição de novas funcionalidades.

**RNF10 – Escalabilidade**

O sistema deve permitir a expansão futura para múltiplas unidades de barbearia, caso necessário.

**RNF11 – Acessibilidade**

O sistema deve utilizar contraste adequado, fontes legíveis e organização visual que favoreça a navegação dos usuários.

---

## Diagrama de casos de uso

---

## Diagrama de classes

---

## Diagramas de sequência 
