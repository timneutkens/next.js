import {
  BUILD_MANIFEST,
  REACT_LOADABLE_MANIFEST,
} from '../shared/lib/constants'
import { join } from 'path'
import { requirePage } from './require'
import { BuildManifest } from './get-page-files'
import { AppType, DocumentType } from '../shared/lib/utils'
import {
  PageConfig,
  GetStaticPaths,
  GetServerSideProps,
  GetStaticProps,
} from 'next/types'

export function interopDefault(mod: any) {
  return mod.default || mod
}

export type ManifestItem = {
  id: number | string
  files: string[]
}

type ReactLoadableManifest = { [moduleId: string]: ManifestItem }

export type LoadComponentsReturnType = {
  Component: React.ComponentType
  pageConfig?: PageConfig
  buildManifest: BuildManifest
  reactLoadableManifest: ReactLoadableManifest
  Document: DocumentType
  App: AppType
  getStaticProps?: GetStaticProps
  getStaticPaths?: GetStaticPaths
  getServerSideProps?: GetServerSideProps
  ComponentMod: any
}

export async function loadDefaultErrorComponents(distDir: string) {
  const Document = interopDefault(require('next/dist/pages/_document'))
  const App = interopDefault(require('next/dist/pages/_app'))
  const ComponentMod = require('next/dist/pages/_error')
  const Component = interopDefault(ComponentMod)

  return {
    App,
    Document,
    Component,
    buildManifest: require(join(distDir, `fallback-${BUILD_MANIFEST}`)),
    reactLoadableManifest: {},
    ComponentMod,
  }
}

export async function loadComponents(
  distDir: string,
  pathname: string
): Promise<LoadComponentsReturnType> {
  const DocumentMod = await requirePage('/_document', distDir)
  const AppMod = await requirePage('/_app', distDir)
  const ComponentMod = await requirePage(pathname, distDir)

  const [
    buildManifest,
    reactLoadableManifest,
    Component,
    Document,
    App,
  ] = await Promise.all([
    require(join(distDir, BUILD_MANIFEST)),
    require(join(distDir, REACT_LOADABLE_MANIFEST)),
    interopDefault(ComponentMod),
    interopDefault(DocumentMod),
    interopDefault(AppMod),
  ])

  const { getServerSideProps, getStaticProps, getStaticPaths } = ComponentMod

  return {
    App,
    Document,
    Component,
    buildManifest,
    reactLoadableManifest,
    pageConfig: ComponentMod.config || {},
    ComponentMod,
    getServerSideProps,
    getStaticProps,
    getStaticPaths,
  }
}
