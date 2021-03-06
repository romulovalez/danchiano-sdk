# D’Anchiano SDK

Esta es la forma más sencilla de añadir D’Anchiano a tu plataforma, solo tendrás que incluir unas cuantas líneas de código y configurar en tu [panel de administración de la API](https://dev.danchiano.com/account/api) el `dominio` desde el que harás la integración


``` bash joinUp joinDown
npm i danchiano-sdk
```

```jsx "Market.jsx" {2,6-9} joinUp
import { useEffect } from 'react'
import { renderMarket } from 'danchiano-sdk'

export default function Market() {
  useEffect(() => {
    renderMarket({
      selector: '#danchiano-sdk',
      clientId: '{{CLIENT_ID}}',
      appUrl: 'https://dev.danchiano.com',
    })
  }, [])

  return <div id="danchiano-sdk" />
}
```

## Métodos disponibles

<Group>
<GroupItem>

A la derecha listamos los métodos disponibles del SDK.

Debajo listamos los parámetros y los métodos que les puedes pasar.

Parámetro | Descripción
--------- | -----------
clientId | Id del cliente
userToken | Token de acceso del [profesional](https://dev.danchiano.com/docs/quickstart/create-applicant#muestra-el-test-en-tu-plataforma) o [empresa](https://dev.danchiano.com/docs/quickstart/create-company#obten-el-token-de-acceso-de-la-empresa)
locale | Idioma <sub>es-ES, ca-ES, en-US, pt-BR</sub>
selector | Selector donde se renderizará la interfaz de D’Anchiano
customize | [Opciones](#objeto-customize) para personalizar la interfaz
applicantData <sub>renderApplicant</sub> | [Datos del profesional](#objeto-applicantdata) a crear
companyData <sub>renderCompany</sub> | [Datos de la empresa](#objeto-companyData) a crear
jobData <sub>renderJob</sub> | [Datos del puesto](#objeto-jobData) a crear
profiles | [Perfiles](#objeto-profiles) a mostrar en el informe
callback | Función a ejecutar cuando ocurra una determinada acción (creación de un profesional, carga de un informe, entre otros). [Más detalles](#tipos-de-callback)

</GroupItem>
<GroupItem>

```js
init: ({ clientId, userToken, locale })
render: ({ selector, customize, callback })
renderApplicant: ({ selector, applicantData, profiles, customize, callback }) 
renderCompany: ({ selector, companyData, customize, callback })
renderJob: ({ selector, jobId = null, jobData, customize, callback })
renderReport: ({ selector, profiles, customize, callback })
renderMarket: ({ selector, profiles, customize, callback })
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
  sex: string().matches(/male|female|neutral/),
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
  site: string().matches(/universal|linkedin|infojobs|buscojobs|manpower|randstad|tecnoempleo|talentclue/),
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
    type: string().matches(/market_applicant|market_job|applicant|job|team/),
    sex: string().matches(/male|female|neutral/),
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
    site: string().matches(/universal|linkedin|infojobs|buscojobs|manpower|randstad|tecnoempleo|talentclue/),
    name: string(),
    levelText: string(),
    functionText: string(),
    sectorText: string(),
  },
  second: {
    id: number().integer(),
    type: string().matches(/market_applicant|market_job|applicant|job|team/),
    sex: string().matches(/male|female|neutral/),
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
    site: string().matches(/universal|linkedin|infojobs|buscojobs|manpower|randstad|tecnoempleo|talentclue/),
    name: string(),
    levelText: string(),
    functionText: string(),
    sectorText: string(),
  },
  selected: string().matches(/first|second|compare/).default('first'),
}
```

## Tipos de callback
```ts
type CallbackProps = {
  action: 'registerApplicant' | 'registerCompany' | 'companyPostJob' | 'getReport'
  applicantId?: number
  companyId?: number
  jobId?: number
  profiles?: ProfilesProps
}
```
