
type ProfileProps = {
  type?: string
  id?: number
  sex?: string
  ageMin?: number
  ageMax?: number
  peopleInCharge?: boolean
  level?: number | number[]
  function?: number | number[]
  sector?: number | number[]
  employees?: number | number[]
  educationalLevel?: number | number[]
  country?: string | string[]
  // Infer profile (for external profiles):
  site?: string
  name?: string
  levelText?: string
  functionText?: string
  sectorText?: string
  // Applicant user
  views?: number
  // Applicant / Job
  added?: boolean
  favorite?: boolean
  visibility?: boolean
  // Job
  companyId?: number
}

type ProfilesProps = {
  first?: ProfileProps
  second?: ProfileProps
  selected?: string
  popup?: string
}

type CallbackProps = {
  action: 'registerApplicant' | 'registerCompany' | 'companyPostJob' | 'getReport'
  applicantId?: number
  companyId?: number
  jobId?: number
  profiles?: ProfilesProps
}

type LocaleProps = 'es-ES' | 'ca-ES' | 'en-US' | 'pt-BR'

type Props = {
  appUrl?: string
  selector?: string
  clientId?: string
  publicKey?: string // DEPRECATED
  userToken?: string
  extension?: boolean
  customize?: any // CustomizeProps
  isForRequest?: boolean
  routeTo?: string
  callback?: (value?: CallbackProps) => void
  applicantData?: any
  companyData?: any
  jobData?: any
  profiles?: any
  jobId?: number
  locale?: LocaleProps
}

let defaultProps: Props = {
  appUrl: 'https://danchiano.com',
}

let iframeNode: any // HtmlIFrameElement
let storedSelector: string
let loadingIframe = false

function loadIframe({ selector, appUrl, routeTo, clientId, userToken, isForRequest }: Props) {
  return new Promise<void>(resolve => {
    if (!selector) {
      // eslint-disable-next-line no-console
      console.error('[D’Anchiano SDK]: selector is not defined')
      return
    }

    const root = document.querySelector(selector)
    if (!root) {
      // eslint-disable-next-line no-console
      console.error(`[D’Anchiano SDK]: ${selector} element not found`)
      return
    }

    const moveIframeNodeToRenderSelector =
      selector &&
      selector !== 'body' &&
      storedSelector === 'body'

    if (moveIframeNodeToRenderSelector) {
      loadingIframe = false
      iframeNode.parentNode?.removeChild(iframeNode)
      // iframeNode = undefined
    }
    if (loadingIframe) {
      iframeNode.addEventListener('load', () => {
        loadingIframe = false
        resolve()
      })
      return
    }
    if (document.body.contains(iframeNode)) {
      resolve()
      return
    }

    // Create iframe
    storedSelector = selector
    iframeNode = document.createElement('iframe')

    const searchUrlParams = [
      userToken != null && `token=${userToken}`,
      clientId != null && `clientId=${clientId}`,
    ].filter(Boolean).join('&')

    // Replace DEPRECATED app.danchiano.com and app-dev.danchiano.com for danchiano and dev.danchiano.com
    if (appUrl === 'https://app.danchiano.com')
      appUrl = 'https://danchiano.com'
    else if (appUrl === 'https://app-dev.danchiano.com')
      appUrl = 'https://dev.danchiano.com'

    iframeNode.setAttribute('src', `${appUrl}${routeTo ?? ''}${searchUrlParams ? `?${searchUrlParams}` : ''}`)
    iframeNode.setAttribute('style', `width: 100%; min-height: 150px; border: 0${isForRequest ? ';display: none' : ''}`)
    root.appendChild(iframeNode)

    loadingIframe = true

    window.addEventListener('message', event => {
      if (event.data.type === 'danchiano_loaded') {
        loadingIframe = false
        resolve()
      } else if (event.data.type === 'danchiano_resize') {
        iframeNode.style.height = event.data.height
      } else if (event.data.type === 'danchiano_redirect') {
        if (!event.data.url) {
          // eslint-disable-next-line no-console
          console.error('[D’Anchiano SDK]: redirect url not defined')
          return
        }

        window.location.href = event.data.url
      }
    }, false)
  })
}

function renderSDK(props: Props) {
  // Remove callbacks from props (can't be passed through postMessage)
  const { callback } = props
  delete props.callback

  loadIframe({
    selector: props.selector ?? defaultProps.selector,
    appUrl: props.appUrl ?? defaultProps.appUrl,
    clientId: props.clientId ?? props.publicKey ?? defaultProps.clientId ?? defaultProps.publicKey,
    userToken: props.userToken ?? defaultProps.userToken,
    routeTo: props.routeTo,
  }).then(() => {
    iframeNode.contentWindow.postMessage({
      type: 'danchiano_render',
      props: { ...defaultProps, ...props },
    }, '*')

    // Listen for callback events
    if (typeof callback === 'function') {
      window.addEventListener('message', event => {
        if (event.data.type === 'danchiano_callback') {
          callback(event.data.result)
        }
      }, false)
    }
  })
}

// // DEPRECATED
// const request = (endpoint: string, params?: any) => loadIframe({ selector: 'body', appUrl: defaultProps.appUrl, isForRequest: true }).then(() => {
//   const key = JSON.stringify({ url: `/api/v2${endpoint}`, ...defaultProps, ...params })
//   iframeNode.contentWindow.postMessage({
//     type: 'danchiano_request',
//     key,
//     url: `/api/v2${endpoint}`,
//     params: { ...defaultProps, ...params },
//   }, '*')

//   // Wait for response and return it
//   return new Promise(resolve => {
//     window.addEventListener('message', event => {
//       if (event.data.type === 'danchiano_response' && event.data.key === key) {
//         resolve(event.data.result)
//       }
//     }, false)
//   })
// })

// common props: selector, extension, customize, callback
export const init = (props?: Props) => {
  defaultProps = { ...defaultProps, ...props }
}
export const render = (props: Props) => {
  renderSDK({ ...props, routeTo: '/login' })
}
export const renderApplicant = (props: Props) => { // applicantData, profiles
  renderSDK({ ...props, routeTo: '/register/applicant' })
}
export const renderCompany = (props: Props) => { // companyData
  renderSDK({ ...props, routeTo: '/register/company' })
}
export const renderJob = (props: Props) => { // jobId, jobData
  renderSDK({ ...props, routeTo: props.jobId != null ? `/jobs/${props.jobId}/report` : '/jobs/new' })
}
export const renderReport = (props: Props) => { // profiles
  renderSDK({ ...props, routeTo: '/report' })
}
export const renderMarket = (props: Props) => { // profiles
  renderSDK({ ...props, routeTo: '/market' })
}
// DEPRECATED: we're now using a token to authenticate the user, so no need for this endpoint
// Aside from that is cancelling requests and are making the servers unstable
export const login = () => {}
// export const login = (email: string, password: string) => request('/login', { method: 'POST', body: { email, password } })
export const logout = () => {}
// export const logout = () => request('/logout')

const Danchiano = {
  init,
  render,
  renderApplicant,
  renderCompany,
  renderJob,
  renderReport,
  renderMarket,
  login,
  logout,
}

export default Danchiano

/**
 * Initialization
 * DEPRECATED: only used on old integrations with CDN
 */
window.Danchiano = Danchiano

declare global {
  interface Window {
    Danchiano?: typeof Danchiano
    danchianoAsyncInit?: () => void
  }
}

function DOMLoaded() {
  if (typeof window.danchianoAsyncInit === 'function')
    window.danchianoAsyncInit()
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', DOMLoaded)
} else {
  DOMLoaded()
}
