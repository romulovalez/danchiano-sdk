import { screen } from '@testing-library/dom'

test('Load SDK', async () => {
  document.body.innerHTML = /* html */`
    <div id="danchiano-sdk" data-testid="danchiano-sdk"></div>
  `

  window.Danchiano.renderMarket({
    selector: '#danchiano-sdk',
    appUrl: 'https://app-dev.danchiano.com',
    customize: { accentColor: '#601A5A', darkMode: false },
  })

  // Should contain an iframe element
  expect(screen.queryByTestId('danchiano-sdk')).not.toBeEmptyDOMElement()
})