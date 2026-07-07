/** @format */

import { Builder, Browser, By, until } from "selenium-webdriver";
import { strict as assert } from "node:assert";

const BASE_URL = "http://localhost:3000";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function destacarElemento(driver, elemento) {
  await driver.executeScript(
    "arguments[0].style.border='3px solid red'; arguments[0].style.boxShadow='0 0 10px red';",
    elemento,
  );

  await sleep(700);

  await driver.executeScript(
    "arguments[0].style.border=''; arguments[0].style.boxShadow='';",
    elemento,
  );
}

async function digitarDevagar(elemento, texto, intervalo = 120) {
  await elemento.clear();

  for (const caractere of texto) {
    await elemento.sendKeys(caractere);
    await sleep(intervalo);
  }
}

async function clicarComPausa(
  driver,
  elemento,
  pausaAntes = 700,
  pausaDepois = 1000,
) {
  await destacarElemento(driver, elemento);
  await sleep(pausaAntes);
  await elemento.click();
  await sleep(pausaDepois);
}

async function preencherServico(driver, nomeServico) {
  console.log("Preenchendo o nome do serviço...");
  const campoNome = await driver.findElement(
    By.css('[data-testid="service-name"]'),
  );
  await destacarElemento(driver, campoNome);
  await digitarDevagar(campoNome, nomeServico);

  await sleep(1000);

  console.log("Preenchendo o preço...");
  const campoPreco = await driver.findElement(
    By.css('[data-testid="service-price"]'),
  );
  await destacarElemento(driver, campoPreco);
  await digitarDevagar(campoPreco, "45");

  await sleep(1000);

  console.log("Selecionando a duração...");
  const campoDuracao = await driver.findElement(
    By.css('[data-testid="service-duration"]'),
  );
  await destacarElemento(driver, campoDuracao);
  await campoDuracao.sendKeys("30");

  await sleep(1200);

  console.log("Preenchendo a descrição...");
  const campoDescricao = await driver.findElement(
    By.css('[data-testid="service-description"]'),
  );
  await destacarElemento(driver, campoDescricao);
  await digitarDevagar(
    campoDescricao,
    "Serviço cadastrado automaticamente pelo Selenium.",
    80,
  );

  await sleep(1200);

  console.log("Clicando no botão de cadastro...");
  const botaoCadastrar = await driver.findElement(
    By.css('[data-testid="service-submit"]'),
  );
  await clicarComPausa(driver, botaoCadastrar, 1000, 2000);
}

async function testeCadastroServico() {
  const driver = await new Builder().forBrowser(Browser.CHROME).build();

  const nomeServico = `Corte Selenium ${Date.now()}`;

  try {
    console.log("Abrindo o navegador Chrome...");
    await driver.manage().window().maximize();

    await sleep(1500);

    console.log("Acessando o sistema BarberAlgo...");
    await driver.get(`${BASE_URL}/servicos`);

    await sleep(2500);

    console.log("Aguardando a tela de serviços carregar...");
    await driver.wait(
      until.elementLocated(By.css('[data-testid="service-name"]')),
      10000,
    );

    await sleep(1500);

    console.log("Iniciando cadastro de um novo serviço...");
    await preencherServico(driver, nomeServico);

    console.log("Verificando se o serviço apareceu na lista...");
    const servicoCriado = await driver.wait(
      until.elementLocated(By.xpath(`//*[contains(text(), "${nomeServico}")]`)),
      10000,
    );

    await destacarElemento(driver, servicoCriado);
    await sleep(2500);

    console.log("Tentando cadastrar o mesmo serviço novamente...");
    await preencherServico(driver, nomeServico);

    console.log("Verificando se o sistema bloqueou o cadastro duplicado...");
    const mensagemErro = await driver.wait(
      until.elementLocated(By.css('[data-testid="service-error"]')),
      10000,
    );

    await destacarElemento(driver, mensagemErro);

    const textoErro = await mensagemErro.getText();

    assert.match(textoErro, /Já existe um serviço com esse nome/i);

    console.log(
      "✅ Teste aprovado: o serviço foi cadastrado e a duplicidade foi bloqueada.",
    );

    await sleep(5000);
  } catch (error) {
    console.error("❌ Teste falhou:", error);
    await sleep(7000);
    throw error;
  } finally {
    await driver.quit();
  }
}

testeCadastroServico();
