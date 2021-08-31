# D'Anchiano SDK

<Group>
<GroupItem>

Esta es la forma más sencilla de añadir D'Anchiano a tu plataforma, solo tendrás que incluir unas cuantas líneas de código y configurar en tu [panel de administración de la API]({{BASE_URL}}/account/api/{{CLIENT_ID}}) el `dominio` desde el que harás la integración

</GroupItem>
<GroupItem>

<Tabs values={[
  { value: 'react', label: 'React' },
  { value: 'browser', label: 'Navegador' },
]}>
<TabItem value="react">

``` bash joinUp joinDown
yarn add danchiano-sdk
```

```jsx "Market.jsx" {2,6-9} joinUp
import { useEffect } from 'react'
import { renderMarket } from 'danchiano-sdk'

export default function Market() {
  useEffect(() => {
    renderMarket({
      selector: '#danchiano-sdk',
      clientId: '{{CLIENT_ID}}',
      appUrl: '{{BASE_URL}}',
    })
  }, [])

  return <div id="danchiano-sdk" />
}
```

</TabItem>
<TabItem value="browser">

```html "index.html" {6,9,11-14}
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>D'Anchiano SDK</title>
    <script src="{{SDK_URL}}"></script>
  </head>
  <body>
    <div id="danchiano-sdk"></div>
    <script>
      Danchiano.renderMarket({
        selector: '#danchiano-sdk',
        clientId: '{{CLIENT_ID}}',
      })
    </script>
  </body>
</html>
```

</TabItem>
</Tabs>

</GroupItem>
</Group>

## Métodos disponibles

<Group>
<GroupItem>

A la derecha listamos los métodos disponibles de la SDK.

Debajo listamos los parámetros y los métodos que les puedes pasar.

Parámetro | Descripción
--------- | -----------
clientId <sub>init, render*</sub> | Id del cliente
userToken <sub>init, render*</sub> | Token de acceso del [profesional](/docs/quickstart/create-applicant#muestra-el-test-en-tu-plataforma) o [empresa](/docs/quickstart/create-company#obten-el-token-de-acceso-de-la-empresa)
locale  <sub>init, render*</sub> | Idioma <sub>es-ES, ca-ES, en-US, pt-BR</sub>
selector <sub>render*</sub> | Selector donde se renderizará la interfaz de D'Anchiano
customize <sub>render*</sub> | [Opciones](#objeto-customize) para personalizar la interfaz
applicantData <sub>renderApplicant</sub> | [Datos del profesional](#objeto-applicantdata) a crear
companyData <sub>renderCompany</sub> | [Datos de la empresa](#objeto-companyData) a crear
jobData <sub>renderJob</sub> | [Datos del puesto](#objeto-jobData) a crear
profiles <sub>render*</sub> | [Perfiles](#objeto-profiles) a mostrar en el informe
callback <sub>render*</sub> | Función a ejecutar cuando ocurra una determinada acción (creación de un profesional, carga de un informe, entre otros). [Más detalles](#tipos-de-callback)

</GroupItem>
<GroupItem>

```js
// Render methods
render: ({ selector, customize, callback })
renderApplicant: ({ selector, applicantData, profiles, customize, callback }) 
renderCompany: ({ selector, companyData, customize, callback })
renderJob: ({ selector, jobId = null, jobData, customize, callback })
renderReport: ({ selector, profiles, customize, callback })
renderMarket: ({ selector, profiles, customize, callback })
// Common methods
init: ({ clientId, userToken, locale })
login: async (email, password)
logout: async ()
getReport: async (profiles)
// Applicant methods
applicantRegister: async (fields)
applicantTestGetQuestion: async ()
applicantTestUpdateTimer: async (secondsPassed)
applicantTestSendAnswer: async (id, answer)
// Company methods
companyRegister: async (fields)
companyGetJobs: async ()
companyPostJob: async (jobData)
companyUpdateJob: async (jobId, jobData)
companyDeleteJob: async (jobId)
companyGetJob: async (jobId)
companyGetJobDescription: async (jobId)
companySetJobDescription: async (jobId, profile, description)
companyGetJobStandardDescription: async (jobId)
companySetJobCompetences: async (jobId, competences)
companyGetJobApplicants: async (jobId, query, page = 0, order)
companyGetJobApplicantsMatch: async (jobId)
companySearchJobApplicants: async (jobId, query, page = 0)
companyJobAddApplicant: async (jobId, applicantId)
companyJobDeleteApplicant: async (jobId, applicantId)
companyJobMarkApplicantAsFavorite: async (jobId, applicantId)
companyJobUnmarkApplicantAsFavorite: async (jobId, applicantId)
```

</GroupItem>
</Group>

## Objeto customize

```js "Valores por defecto"
{
  accentColor: '#3ca',
  primaryFont: 'Montserrat, sans-serif',
  secondaryFont: 'Lato, sans-serif',
  loginUrl: null,
  blockLogo: false,
  blockReportDescription: false,
  defaultReportPage: 'detailed', // resume | detailed
  darkMode: false, // true | false | null (null = autodetects from browser)
  taskColor: '#0bd',
  peopleColor: '#9c5',
  contextColor: '#fc4',
  compareColor: '#f60',
  positioningColor: '#4b9faa',
  primaryErrorColor: '#e42',
  secondaryErrorColor: '#EC5990',
  tourColor: '#357cf0',
  doneColor: '#25C133',
}
```

## Objeto applicantData
```js "Esquema"
{
  // Register info
  email: string().email().required(),
  password: string(),
  peopleInCharge: boolean(),
  // Personal info
  image: string(),
  firstname: string(),
  lastname: string(),
  birthdate: string(),
  sex: string().matches(/(male|female|neutral)/),
  country: string(),
  province: string(),
  city: string(),
  cp: string().nullable(),
  // Job info
  company: string(),
  job: string(),
  employees: number().integer().min(0).max(8),
  educationalLevel: number().integer().min(0).max(6),
  level: number().integer().min(0).max(5),
  function: number().integer().min(0).max(34),
  sector: number().integer().min(0).max(147),
}
```

## Objeto companyData
```js "Esquema"
{
  // Register info
  email: string().email().required(),
  password: string(),
  // Company info
  image: string(),
  name: string(),
  nif: string(),
  employees: number().integer().min(0).max(8),
  sector: number().integer().min(0).max(147),
  country: string(),
  province: string(),
  city: string(),
  cp: string().nullable(),
  address: string(),
  // Contact info
  contactFirstname: string(),
  contactLastname: string(),
  contactPhone: string(),
}
```

## Objeto jobData
```js "Esquema"
{
  name: string(),
  educationalLevel: number().integer().min(0).max(6),
  level: number().integer().min(0).max(5),
  function: number().integer().min(0).max(34),
  sector: number().integer().min(0).max(147),
  country: string(),
  province: string(),
  city: string(),
  cp: string().nullable(),
  peopleInCharge: boolean(),
  // Infer profile (for external profiles):
  site: string().matches(/(universal|linkedin|infojobs|buscojobs|manpower|randstad|tecnoempleo|talentclue)/),
  name: string(),
  levelText: string(),
  functionText: string(),
  sectorText: string(),
}
```

## Objeto profiles
```js "Esquema"
{
  first: {
    id: number().integer(),
    type: string().matches(/(market_applicant|market_job|applicant|job|team)/),
    sex: string().matches(/(male|female|neutral)/),
    ageMin: number().integer().min(0).max(120),
    ageMax: number().integer().min(0).max(120),
    peopleInCharge: boolean(),
    level: array().of(number().integer().min(0).max(5)),
    function: array().of(number().integer().min(0).max(34)),
    sector: array().of(number().integer().min(0).max(147)),
    employees: array().of(number().integer().min(0).max(8)),
    educationalLevel: array().of(number().integer().min(0).max(6)),
    country: array().of(string()),
    // Infer profile (for external profiles):
    site: string().matches(/(universal|linkedin|infojobs|buscojobs|manpower|randstad|tecnoempleo|talentclue)/),
    name: string(),
    levelText: string(),
    functionText: string(),
    sectorText: string(),
  },
  second: {
    id: number().integer(),
    type: string().matches(/(market_applicant|market_job|applicant|job|team)/),
    sex: string().matches(/(male|female|neutral)/),
    ageMin: number().integer().min(0).max(120),
    ageMax: number().integer().min(0).max(120),
    peopleInCharge: boolean(),
    level: array().of(number().integer().min(0).max(5)),
    function: array().of(number().integer().min(0).max(34)),
    sector: array().of(number().integer().min(0).max(147)),
    employees: array().of(number().integer().min(0).max(8)),
    educationalLevel: array().of(number().integer().min(0).max(6)),
    country: array().of(string()),
    // Infer profile (for external profiles):
    site: string().matches(/(universal|linkedin|infojobs|buscojobs|manpower|randstad|tecnoempleo|talentclue)/),
    name: string(),
    levelText: string(),
    functionText: string(),
    sectorText: string(),
  },
  selected: string().matches(/(first|second|compare)/).default('first'),
  onlyIndicators: boolean(),
}
```
