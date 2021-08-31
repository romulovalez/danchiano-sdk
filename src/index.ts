
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
  locale?: 'es-ES' | 'ca-ES' | 'en-US' | 'pt-BR'
}

let defaultProps: Props = {
  appUrl: 'https://app.danchiano.com',
  // appUrl: 'https://app-dev.danchiano.com',
  // appUrl: 'http://localhost:8080',
}

let iframeNode: any // HtmlIFrameElement
let storedSelector: string
let loadingIframe = false

function loadIframe({ selector, appUrl, routeTo, clientId, userToken, isForRequest }: Props) {
  return new Promise<void>(resolve => {
    if (!selector) {
      // eslint-disable-next-line no-console
      console.error("[D'Anchiano SDK]: selector is not defined")
      return
    }

    const root = document.querySelector(selector)
    if (!root) {
      // eslint-disable-next-line no-console
      console.error(`[D'Anchiano SDK]: ${selector} element not found`)
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
    iframeNode.setAttribute('src', `${appUrl}${routeTo ?? ''}${userToken || clientId ? `?${[userToken && `token=${userToken}`, clientId && `clientId=${clientId}`].filter(Boolean).join('&')}` : ''}`)
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
          console.error("[D'Anchiano SDK]: redirect url not defined")
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

const request = (endpoint: string, params?: any) => loadIframe({ selector: 'body', appUrl: defaultProps.appUrl, isForRequest: true }).then(() => {
  const key = JSON.stringify({ url: `/api/v2${endpoint}`, ...defaultProps, ...params })
  iframeNode.contentWindow.postMessage({
    type: 'danchiano_request',
    key,
    url: `/api/v2${endpoint}`,
    params: { ...defaultProps, ...params },
  }, '*')

  // Wait for response and return it
  return new Promise(resolve => {
    window.addEventListener('message', event => {
      if (event.data.type === 'danchiano_response' && event.data.key === key) {
        resolve(event.data.result)
      }
    }, false)
  })
})

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
// Common methods
export const login = (email: string, password: string) => request('/login', { method: 'POST', body: { email, password } })
export const logout = () => request('/logout')
export const setLocale = (locale: string) => request(`/language/${locale}`, { method: 'POST' })
export const getReport = (profiles: any) => request('/report', { method: 'POST', body: profiles })
// Applicant methods
export const applicantRegister = (fields: any) => request('/applicant', { method: 'POST', contentType: null, body: fields })
export const applicantTestGetQuestion = () => request('/applicant/questions')
export const applicantTestUpdateTimer = (secondsPassed: number) => request('/applicant/test-timer', { method: 'PATCH', body: { timer: secondsPassed } })
export const applicantTestSendAnswer = (id: number, answer: string) => request(`/applicant/answer/${id}`, { method: 'POST', body: { answerValue: answer } })
// Company methods
export const companyRegister = (fields: any) => request('/companies', { method: 'POST', contentType: null, body: fields })
export const companyGetJobs = () => request('/companies/jobs')
export const companyPostJob = (jobData: any) => request('/companies/jobs', { method: 'POST', body: jobData })
export const companyUpdateJob = (jobId: number, jobData: any) => request(`/companies/jobs/${jobId}`, { method: 'PATCH', body: jobData })
export const companyDeleteJob = (jobId: number) => request(`/companies/jobs/${jobId}`, { method: 'DELETE' })
export const companyGetJob = (jobId: number) => request(`/companies/jobs/${jobId}`)
export const companyGetJobDescription = (jobId: number) => request(`/companies/jobs/${jobId}/description`)
export const companySetJobDescription = (jobId: number, profile: any, description: any) => request(`/companies/jobs/${jobId}/description`, { method: 'POST', body: { profile, description } })
export const companyGetJobStandardDescription = (jobId: number) => request(`/companies/jobs/${jobId}/description/standard`)
export const companySetJobCompetences = (jobId: number, competences: number[]) => request(`/companies/jobs/${jobId}/competences`, { method: 'POST', body: { competences } })
export const companyGetJobApplicants = (jobId: number, query: string, page = 0, order: string) => request(`/companies/jobs/${jobId}/applicants?q=${query}&p=${page}&o=${order}&onlyAdded=true`)
export const companyGetJobApplicantsMatch = (jobId: number) => request(`/companies/jobs/${jobId}/applicants?onlyAdded=true&onlyMatch=true`)
export const companySearchJobApplicants = (jobId: number, query: string, page = 0) => request(`/companies/jobs/${jobId}/applicants?q=${query}&p=${page}`)
export const companyJobAddApplicant = (jobId: number, applicantId: number) => request(`/companies/jobs/${jobId}/applicants/${applicantId}`, { method: 'POST' })
export const companyJobDeleteApplicant = (jobId: number, applicantId: number) => request(`/companies/jobs/${jobId}/applicants/${applicantId}`, { method: 'DELETE' })
export const companyJobMarkApplicantAsFavorite = (jobId: number, applicantId: number) => request(`/companies/jobs/${jobId}/applicants/${applicantId}/favorite`, { method: 'POST' })
export const companyJobUnmarkApplicantAsFavorite = (jobId: number, applicantId: number) => request(`/companies/jobs/${jobId}/applicants/${applicantId}/favorite`, { method: 'DELETE' })

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
  setLocale,
  getReport,
  applicantRegister,
  applicantTestGetQuestion,
  applicantTestUpdateTimer,
  applicantTestSendAnswer,
  companyRegister,
  companyGetJobs,
  companyPostJob,
  companyUpdateJob,
  companyDeleteJob,
  companyGetJob,
  companyGetJobDescription,
  companySetJobDescription,
  companyGetJobStandardDescription,
  companySetJobCompetences,
  companyGetJobApplicants,
  companyGetJobApplicantsMatch,
  companySearchJobApplicants,
  companyJobAddApplicant,
  companyJobDeleteApplicant,
  companyJobMarkApplicantAsFavorite,
  companyJobUnmarkApplicantAsFavorite,
}

export default Danchiano

// // Types of callback
// callback = ({ action: 'applicantRegister', applicantId })
// callback = ({ action: 'companyRegister', companyId })
// callback = ({ action: 'companyPostJob', jobId })
// callback = ({ action: 'getReport', ...profiles })

// /**
//  * Initialization
//  */
// declare global {
//   interface Window {
//     danchianoAsyncInit?: () => void
//   }
// }

// function DOMLoaded() {
//   if (typeof window.danchianoAsyncInit === 'function') {
//     window.danchianoAsyncInit()
//   } else {
//     // eslint-disable-next-line no-console
//     console.error("[D'Anchiano SDK]: danchianoAsyncInit is not defined")
//   }
// }

// if (document.readyState === 'loading') {
//   document.addEventListener('DOMContentLoaded', DOMLoaded)
// } else {
//   init()
// }
