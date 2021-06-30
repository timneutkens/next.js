import chalk from 'chalk'
import { posix, join } from 'path'
import { stringify } from 'querystring'
import { API_ROUTE, DOT_NEXT_ALIAS, PAGES_DIR_ALIAS } from '../lib/constants'
import { __ApiPreviewProps } from '../server/api-utils'
import { normalizePagePath } from '../server/normalize-page-path'
import { warn } from './output/log'
import { ClientPagesLoaderOptions } from './webpack/loaders/next-client-pages-loader'
import { LoadedEnvFiles } from '@next/env'
import { NextConfig } from '../server/config'

type PagesMapping = {
  [page: string]: string
}

export function createPagesMapping(
  pagePaths: string[],
  extensions: string[]
): PagesMapping {
  const previousPages: PagesMapping = {}
  const pages: PagesMapping = pagePaths.reduce(
    (result: PagesMapping, pagePath): PagesMapping => {
      let page = `${pagePath
        .replace(new RegExp(`\\.+(${extensions.join('|')})$`), '')
        .replace(/\\/g, '/')}`.replace(/\/index$/, '')

      const pageKey = page === '' ? '/' : page

      if (pageKey in result) {
        warn(
          `Duplicate page detected. ${chalk.cyan(
            join('pages', previousPages[pageKey])
          )} and ${chalk.cyan(
            join('pages', pagePath)
          )} both resolve to ${chalk.cyan(pageKey)}.`
        )
      } else {
        previousPages[pageKey] = pagePath
      }
      result[pageKey] = join(PAGES_DIR_ALIAS, pagePath).replace(/\\/g, '/')
      return result
    },
    {}
  )

  pages['/_app'] = pages['/_app'] || 'next/dist/pages/_app'
  pages['/_error'] = pages['/_error'] || 'next/dist/pages/_error'
  pages['/_document'] = pages['/_document'] || 'next/dist/pages/_document'

  return pages
}

export type WebpackEntrypoints = {
  [bundle: string]:
    | string
    | string[]
    | {
        import: string | string[]
        dependOn?: string | string[]
      }
}

type Entrypoints = {
  client: WebpackEntrypoints
  server: WebpackEntrypoints
}

export function createEntrypoints(
  pages: PagesMapping,
  target: 'server'
): Entrypoints {
  const client: WebpackEntrypoints = {}
  const server: WebpackEntrypoints = {}

  Object.keys(pages).forEach((page) => {
    const absolutePagePath = pages[page]
    const bundleFile = normalizePagePath(page)
    const isApiRoute = page.match(API_ROUTE)

    const clientBundlePath = posix.join('pages', bundleFile)
    const serverBundlePath = posix.join('pages', bundleFile)

    if (isApiRoute || target === 'server') {
      server[serverBundlePath] = [absolutePagePath]
    }

    if (page === '/_document') {
      return
    }

    if (!isApiRoute) {
      const pageLoaderOpts: ClientPagesLoaderOptions = {
        page,
        absolutePagePath,
      }
      const pageLoader = `next-client-pages-loader?${stringify(
        pageLoaderOpts
      )}!`

      // Make sure next/router is a dependency of _app or else chunk splitting
      // might cause the router to not be able to load causing hydration
      // to fail

      client[clientBundlePath] =
        page === '/_app'
          ? [pageLoader, require.resolve('../client/router')]
          : pageLoader
    }
  })

  return {
    client,
    server,
  }
}
