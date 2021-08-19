const TestUtil = require('../utils/TestUtils')
const TestDataUtils = require('../utils/TestDataUtils')
const OverviewPage = require('../Pages/OverviewPage')
const HomePage = require('../Pages/HomePage')
const PasswordPage = require('../Pages/PasswordPage')
const SeedWordsPage = require('../Pages/SeedWordsPage')
const expect = require('chai').expect

const puppeteer = require('puppeteer')

const testUtil = new TestUtil()
const testDataUtils = new TestDataUtils()
const overviewPage = new OverviewPage()
const homePage = new HomePage()
const passwordPage = new PasswordPage()
const seedWordsPage = new SeedWordsPage()

let browser, page
const password = '123123123'

describe.skip('Liquality wallet- Import wallet-["mainnet"]-Browserstack test', async () => {
  beforeEach(async () => {
    const caps = {
      browser: 'chrome', // You can choose `chrome`, `edge` or `firefox` in this capability
      browser_version: 'latest', // We support v83 and above. You can choose `latest`, `latest-beta`, `latest-1`, `latest-2` and so on, in this capability
      os: 'os x',
      os_version: 'big sur',
      build: 'puppeteer-build-1',
      name: 'Liquality wallet- Import wallet', // The name of your test and build. See browserstack.com/docs/automate/puppeteer/organize tests for more details
      'browserstack.username': process.env.BROWSERSTACK_USERNAME || 'raj_T62SqR',
      'browserstack.accessKey': process.env.BROWSERSTACK_ACCESS_KEY || 'SYb3apzjYGJUpEAgVtyd',
      'browserstack.networkLogs': true,
      options: {
        ...testUtil.getChromeOptions()
      }
    }

    browser = await puppeteer.connect({
      browserWSEndpoint:
        `wss://cdp.browserstack.com?caps=${encodeURIComponent(JSON.stringify(caps))}`
    })

    // browser = await puppeteer.launch(testUtil.getChromeOptions())
    page = await browser.newPage()
    await page.goto(testUtil.extensionRootUrl)
    await homePage.ScrollToEndOfTerms(page)
    await homePage.ClickOnAcceptPrivacy(page)
  })

  afterEach(async () => {
    try {
      await page.evaluate(_ => {}, `browserstack_executor: ${JSON.stringify({
 action: 'setSessionStatus',
        arguments: {
          status: 'passed',
          reason: 'Title matched'
        }
      })}`)
    } catch (e) {
      await page.evaluate(_ => {}, `browserstack_executor: ${JSON.stringify({
 action: 'setSessionStatus',
        arguments: {
          status: 'failed',
          reason: 'Title did not match'
        }
      })}`)
    }
    await browser.close()
  })

  it('Import wallet with random seed (phrase 12 words) with 0 coins', async () => {
    await homePage.ClickOnImportWallet(page)
    console.log('Import wallet page hase been loaded')

    // check continue button has been disabled
    const enterWords = testDataUtils.getRandomSeedWords()
    await seedWordsPage.EnterImportSeedWords(page, enterWords)
    // Create a password & submit
    await passwordPage.SubmitPasswordDetails(page, password)
    // overview page
    await overviewPage.HasOverviewPageLoaded(page)
    await overviewPage.CloseWatsNewModal(page)
    if (process.env.NODE_ENV === 'mainnet') {
      await overviewPage.SelectNetwork(page, 'mainnet')
    } else {
      await overviewPage.SelectNetwork(page)
    }
    // check Send & Swap & Receive options have been displayed
    await overviewPage.ValidateSendSwipeReceiveOptions(page)
    // validate the testnet asserts count
    const assetsCount = await overviewPage.GetTotalAssets(page)
    expect(assetsCount, 'Total assets in TESTNET should be 7').contain('7 Assets')
  })
  it('Import wallet with random seed (phrase 11 words) and check continue is disabled', async () => {
    await homePage.ClickOnImportWallet(page)
    console.log('Import wallet page hase been loaded')
    // check continue button has been disabled
    const seedWords = 'blouse sort ice forward ivory enrich connect mimic apple setup level'
    const enterWord = seedWords.split(' ')
    const seedsWordsCount = await page.$$('#import_wallet_word')
    for (let i = 0; i < enterWord.length; i++) {
      const wordInput = seedsWordsCount[i]
      await wordInput.type(enterWord[i])
    }
    // Continue button has been Disabled
    await page.click('#import_wallet_continue_button:not([enabled])')
    console.log('Import wallet continue button has been disabled')
  })
  it('Import wallet with (12 seed words) and see balance & validate ETH & RSK derived path', async () => {
    // Import wallet option
    await homePage.ClickOnImportWallet(page)
    // Enter seed words and submit
    await homePage.EnterSeedWords(page, null)
    // Create a password & submit
    await passwordPage.SubmitPasswordDetails(page, password)
    // overview page
    await overviewPage.HasOverviewPageLoaded(page)
    await overviewPage.CloseWatsNewModal(page)
    if (process.env.NODE_ENV === 'mainnet') {
      await overviewPage.SelectNetwork(page, 'mainnet')
    } else {
      await overviewPage.SelectNetwork(page)
    }
    // check Send & Swap & Receive options have been displayed
    await overviewPage.ValidateSendSwipeReceiveOptions(page)
    // validate the testnet asserts count
    const assetsCount = await overviewPage.GetTotalAssets(page)
    expect(assetsCount, 'Total assets in TESTNET should be 7').contain('7 Assets')
    // Check the currency
    expect(await overviewPage.GetCurrency(page),
      'Wallet stats has currency should be USD').contain('USD')

    // Check the Total amount - 10s wait to load amount
    const totalAmount = await overviewPage.GetTotalLiquidity(page)
    expect(parseInt(totalAmount), 'Funds in my wallet should be greater than 0 USD').greaterThanOrEqual(0)
    console.log('After Import wallet, the funds in the wallet:', totalAmount)

    // GET the ETHEREUM assert Address
    const ethAddress = await overviewPage.GetAssertAddress(page, 'ETHEREUM')
    const rskAddress = await overviewPage.GetAssertAddress(page, 'RSK')
    expect(rskAddress, 'ETH & RSK Addresses should be different if balance >0').not.equals(ethAddress)
  })
  it('Import wallet with (24 seed words) and see balance', async () => {
    // Import wallet option
    await homePage.ClickOnImportWallet(page)
    // Enter seed words and submit, select 24 seed option
    await page.waitForSelector('#word_button_group', { visible: true })
    await page.click('#twenty_four_words_option')
    const seedWords = await page.$$eval('#import_wallet_word', (el) => el.length)
    expect(seedWords).equals(24)
    // Enter 24 seed words
    await homePage.EnterSeedWords(page, 24)
    // Create a password & submit
    await passwordPage.SubmitPasswordDetails(page, password)
    // overview page
    await overviewPage.HasOverviewPageLoaded(page)
    await overviewPage.CloseWatsNewModal(page)
    // Select testnet
    await overviewPage.SelectNetwork(page)
    // check Send & Swap & Receive options have been displayed
    await overviewPage.ValidateSendSwipeReceiveOptions(page)
    // validate the testnet asserts count
    const assetsCount = await overviewPage.GetTotalAssets(page)
    expect(assetsCount, 'Total assets in TESTNET should be 7').contain('7 Assets')
    // Check the currency
    expect(await overviewPage.GetCurrency(page),
      'Wallet stats has currency should be USD').contain('USD')
  })
})
